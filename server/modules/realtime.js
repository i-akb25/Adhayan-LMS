const { Server } = require("socket.io");
const { Session, User, Message } = require("../models");
const { roomAccess } = require("./learning");
const { parse, objectId, text, hash } = require("../lib/security");
const { z } = require("zod");
const { cookieNames } = require("./auth");
function realtime(server, app) {
  const config = app.locals.config;
  const io = new Server(server, {
    maxHttpBufferSize: 16384,
    cors: { origin: config.origins, credentials: true },
    allowRequest: (req, cb) =>
      cb(null, config.origins.includes(req.headers.origin)),
  });
  async function valid(socket, roomId) {
    if (Date.now() > socket.data.expires) throw Error();
    const s = await Session.exists({
      _id: socket.data.sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    const u = await User.findOne({
      _id: socket.data.user._id,
      isActive: true,
      isDeleted: { $ne: true },
    });
    if (!s || !u || u.tokenVersion !== socket.data.user.tokenVersion)
      throw Error();
    if (
      ["locked", "suspended", "banned", "inactive", "deleted"].includes(
        u.status?.toLowerCase(),
      )
    )
      throw Error();
    if (roomId) await roomAccess(u, roomId);
    return u;
  }
  async function broadcast(roomId, event, data, exclude) {
    for (const socket of io.sockets.sockets.values()) {
      if (socket.id === exclude || !socket.rooms.has(roomId)) continue;
      try {
        await valid(socket, roomId);
        socket.emit(event, data);
      } catch {
        socket.disconnect(true);
      }
    }
  }
  io.use(async (socket, next) => {
    try {
      const cookies = Object.fromEntries(
        (socket.request.headers.cookie || "").split(";").map((v) => {
          const i = v.indexOf("=");
          return [v.slice(0, i).trim(), decodeURIComponent(v.slice(i + 1))];
        }),
      );
      const raw = cookies[cookieNames.access];
      if (!raw) throw Error();
      const s = await Session.findOne({
        accessHash: app.locals.auth.accessHash(raw),
        revokedAt: null,
        accessExpiresAt: { $gt: new Date() },
        expiresAt: { $gt: new Date() },
      }).select("+csrfHash");
      if (!s || hash(socket.handshake.auth.csrf || "") !== s.csrfHash)
        throw Error();
      const u = await User.findOne({
        _id: s.userId,
        isActive: true,
        isDeleted: { $ne: true },
      });
      if (
        !u ||
        u.tokenVersion !== s.version ||
        !["student", "teacher", "parent", "admin"].includes(u.role)
      )
        throw Error();
      socket.data.user = u;
      socket.data.sessionId = s._id;
      socket.data.expires = s.accessExpiresAt.getTime();
      await valid(socket);
      next();
    } catch {
      next(new Error("Authentication required."));
    }
  });
  io.on("connection", (socket) => {
    let count = 0,
      windowStart = Date.now();
    const expiry = setTimeout(
      () => socket.disconnect(true),
      Math.max(1, socket.data.expires - Date.now()),
    );
    expiry.unref();
    socket.use(async (_packet, next) => {
      try {
        if (Date.now() - windowStart > 60000) {
          windowStart = Date.now();
          count = 0;
        }
        if (++count > 120) throw Error();
        socket.data.user = await valid(socket);
        next();
      } catch {
        socket.disconnect(true);
      }
    });
    const handle = (name, schema, fn) =>
      socket.on(name, async (value, ack) => {
        const reply = typeof ack === "function" ? ack : () => {};
        try {
          if (process.env.BACKUP_WRITES_PAUSED === "true") throw Error();
          await fn(parse(schema, value), reply);
        } catch {
          reply({ success: false, message: "Room action denied." });
        }
      });
    handle(
      "room:join",
      z.object({ roomId: objectId }).strict(),
      async ({ roomId }, ack) => {
        await roomAccess(socket.data.user, roomId);
        await socket.join(roomId);
        socket.emit("room:joined", { roomId });
        ack({ success: true });
      },
    );
    handle(
      "room:leave",
      z.object({ roomId: objectId }).strict(),
      async ({ roomId }, ack) => {
        await socket.leave(roomId);
        if (socket.data.callRoom === roomId) {
          socket.data.callRoom = null;
          await broadcast(roomId, "call:left", { id: socket.id }, socket.id);
        }
        socket.emit("room:left", { roomId });
        ack({ success: true });
      },
    );
    handle(
      "chat:message:send",
      z
        .object({
          roomId: objectId,
          content: text(4000),
          type: z.literal("text").optional(),
        })
        .strict(),
      async ({ roomId, content }, ack) => {
        await roomAccess(socket.data.user, roomId);
        const m = await Message.create({
          roomId,
          userId: socket.data.user._id,
          name: socket.data.user.name,
          content,
        });
        await broadcast(roomId, "chat:message", {
          id: String(m._id),
          roomId,
          name: m.name,
          content,
          createdAt: m.createdAt,
        });
        ack({ success: true });
      },
    );
    handle(
      "call:join",
      z.object({ roomId: objectId }).strict(),
      async ({ roomId }, ack) => {
        await roomAccess(socket.data.user, roomId);
        const existing = [...io.sockets.sockets.values()].filter(
          (s) => s.data.callRoom === roomId && s.id !== socket.id,
        );
        if (existing.length >= 5) throw Error();
        for (const peer of existing) await valid(peer, roomId);
        if (socket.data.callRoom && socket.data.callRoom !== roomId)
          throw Error();
        socket.data.callRoom = roomId;
        await socket.join(roomId);
        socket.emit(
          "call:peers",
          existing.map((p) => ({ id: p.id, name: p.data.user.name })),
        );
        ack({ success: true });
      },
    );
    handle(
      "call:leave",
      z.object({ roomId: objectId }).strict(),
      async ({ roomId }, ack) => {
        if (socket.data.callRoom === roomId) {
          socket.data.callRoom = null;
          await broadcast(roomId, "call:left", { id: socket.id }, socket.id);
        }
        ack({ success: true });
      },
    );
    handle(
      "signal",
      z
        .object({ roomId: objectId, to: text(100), signal: z.unknown() })
        .strict(),
      async ({ roomId, to, signal }, ack) => {
        await roomAccess(socket.data.user, roomId);
        const target = io.sockets.sockets.get(to);
        if (socket.data.callRoom !== roomId || target?.data.callRoom !== roomId)
          throw Error();
        await valid(target, roomId);
        if (JSON.stringify(signal).length > 12000) throw Error();
        target.emit("signal", {
          from: socket.id,
          name: socket.data.user.name,
          roomId,
          signal,
        });
        ack({ success: true });
      },
    );
    const point = z
      .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
      .strict();
    handle(
      "board:stroke",
      z
        .object({
          roomId: objectId,
          from: point,
          to: point,
          color: z.enum(["#111827", "#4f46e5", "#dc2626"]),
        })
        .strict(),
      async (data, ack) => {
        await roomAccess(socket.data.user, data.roomId);
        if (!socket.rooms.has(data.roomId)) throw Error();
        await broadcast(data.roomId, "board:stroke", data, socket.id);
        ack({ success: true });
      },
    );
    socket.on("disconnect", () => {
      clearTimeout(expiry);
      const roomId = socket.data.callRoom;
      if (roomId)
        broadcast(roomId, "call:left", { id: socket.id }, socket.id).catch(
          () => {},
        );
    });
  });
  return io;
}
module.exports = { realtime };
