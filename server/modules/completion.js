const express = require("express");
const { z } = require("zod");
const crypto = require("node:crypto");
const M = require("../models");
const {
  wrap,
  parse,
  fail,
  text,
  objectId,
  publicUser,
} = require("../lib/security");
const { courseAccess, roomAccess, output } = require("./learning");
const { notifyCourse } = require("../lib/notifications");
const same = (a, b) => String(a) === String(b);
function pagination(query) {
  return parse(
    z
      .object({
        page: z.coerce.number().int().min(1).max(10000).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(25),
        q: z.string().trim().max(100).default(""),
        status: z.enum(["open", "resolved", "dismissed"]).default("open"),
      })
      .strict(),
    query,
  );
}
async function classAccess(user, room) {
  if (!room.scheduledClassId) return;
  const c = await M.ScheduledClass.findById(room.scheduledClassId);
  if (!c || c.cancelled) fail(409, "This class has been cancelled.");
  if (
    user.role !== "admin" &&
    !same(c.ownerId, user._id) &&
    (Date.now() < c.startsAt.getTime() - 600000 ||
      Date.now() > c.endsAt.getTime() + 900000)
  )
    fail(
      409,
      "The class room opens 10 minutes before the start and closes 15 minutes after the end.",
    );
}
function createCompletion(auth) {
  const r = express.Router();
  r.use(auth.authenticate);
  const teacher = auth.roles("teacher", "admin"),
    admin = auth.roles("admin");
  r.get(
    "/admin/users/page",
    admin,
    wrap(async (req, res) => {
      const { page, limit, q } = pagination(req.query);
      const filter = { isDeleted: { $ne: true } };
      if (q) {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { name: { $regex: escaped, $options: "i" } },
          { email: { $regex: escaped, $options: "i" } },
        ];
      }
      const [total, users] = await Promise.all([
        M.User.countDocuments(filter),
        M.User.find(filter)
          .sort({ _id: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);
      res.json({
        success: true,
        data: users.map(publicUser),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }),
  );
  r.get(
    "/classes",
    wrap(async (req, res) => {
      const { courseId } = parse(
        z.object({ courseId: objectId }).strict(),
        req.query,
      );
      await courseAccess(req.user, courseId);
      res.json({
        success: true,
        data: (
          await M.ScheduledClass.find({ courseId })
            .sort({ startsAt: 1 })
            .limit(200)
        ).map(output),
      });
    }),
  );
  r.post(
    "/classes",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            courseId: objectId,
            title: text(),
            startsAt: z.string().datetime(),
            endsAt: z.string().datetime(),
          })
          .strict(),
        req.body,
      );
      await courseAccess(req.user, data.courseId, true);
      validateTime(data);
      const cid = new (require("mongoose").Types.ObjectId)(),
        rid = new (require("mongoose").Types.ObjectId)();
      const room = await M.Room.create({
        _id: rid,
        ownerId: req.user._id,
        courseId: data.courseId,
        scheduledClassId: cid,
        name: data.title,
        members: [req.user._id],
        description: "Scheduled course class",
      });
      let c;
      try {
        c = await M.ScheduledClass.create({
          _id: cid,
          ...data,
          ownerId: req.user._id,
          roomId: rid,
        });
      } catch (e) {
        await room.deleteOne();
        throw e;
      }
      // Class creation is durable even if a transient notification failure occurs.
      await notifyCourse(
        c.courseId,
        "Class scheduled",
        `${c.title} · ${c.startsAt.toISOString()}`,
      ).catch(() => process.stderr.write("Class notifications unavailable\n"));
      res.status(201).json({ success: true, data: output(c) });
    }),
  );
  r.patch(
    "/classes/:id",
    teacher,
    wrap(async (req, res) => {
      const c = await M.ScheduledClass.findById(parse(objectId, req.params.id));
      if (!c) fail(404, "Class not found.");
      await courseAccess(req.user, c.courseId, true);
      const data = parse(
        z
          .object({
            title: text().optional(),
            startsAt: z.string().datetime().optional(),
            endsAt: z.string().datetime().optional(),
            cancelled: z.boolean().optional(),
          })
          .strict(),
        req.body,
      );
      if (c.cancelled)
        fail(
          409,
          "Cancelled classes cannot be reopened. Schedule a new class.",
        );
      if (data.startsAt || data.endsAt)
        validateTime({
          startsAt: data.startsAt || c.startsAt.toISOString(),
          endsAt: data.endsAt || c.endsAt.toISOString(),
        });
      Object.assign(c, data);
      await c.save();
      await M.Room.updateOne(
        { _id: c.roomId },
        { $set: { name: c.title, ...(c.cancelled ? { closed: true } : {}) } },
      );
      await notifyCourse(
        c.courseId,
        c.cancelled ? "Class cancelled" : "Class updated",
        `${c.title} · ${c.startsAt.toISOString()}`,
      ).catch(() => process.stderr.write("Class notifications unavailable\n"));
      res.json({ success: true, data: output(c) });
    }),
  );
  r.get(
    "/classes/:id/calendar",
    wrap(async (req, res) => {
      const c = await M.ScheduledClass.findById(parse(objectId, req.params.id));
      if (!c) fail(404, "Class not found.");
      await courseAccess(req.user, c.courseId);
      const stamp = (v) =>
        new Date(v)
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}Z$/, "Z");
      const escape = (v) =>
        String(v)
          .replace(/\\/g, "\\\\")
          .replace(/\r?\n/g, "\\n")
          .replace(/[,;]/g, (c) => "\\" + c);
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ADHAYAN//Classes//EN",
        "BEGIN:VEVENT",
        `UID:${c._id}@adhayan`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(c.startsAt)}`,
        `DTEND:${stamp(c.endsAt)}`,
        `SUMMARY:${escape(c.title)}`,
        `DESCRIPTION:Open your ADHAYAN classes page to join.`,
        `STATUS:${c.cancelled ? "CANCELLED" : "CONFIRMED"}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      // Fold by Unicode code point so each physical line fits the iCalendar byte limit.
      const folded = lines.map((line) => {
        let result = "",
          chunk = "";
        for (const char of line) {
          if (Buffer.byteLength(chunk + char) > 73) {
            result += chunk + "\r\n";
            chunk = " ";
          }
          chunk += char;
        }
        return result + chunk;
      });
      res
        .set({
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'attachment; filename="adhayan-class.ics"',
        })
        .send(folded.join("\r\n") + "\r\n");
    }),
  );
  r.get(
    "/rooms/:id",
    wrap(async (req, res) => {
      const room = await roomAccess(req.user, req.params.id);
      const out = output(room);
      delete out.members;
      delete out.blockedMembers;
      res.json({ success: true, data: out });
    }),
  );
  r.delete(
    "/rooms/:id/messages/:messageId",
    wrap(async (req, res) => {
      const room = await roomAccess(req.user, req.params.id);
      const message = await M.Message.findOne({
        _id: parse(objectId, req.params.messageId),
        roomId: room._id,
      });
      if (!message) fail(404, "Message not found.");
      if (
        !same(message.userId, req.user._id) &&
        !same(room.ownerId, req.user._id) &&
        req.user.role !== "admin"
      )
        fail(403, "Message removal denied.");
      await message.deleteOne();
      res.json({ success: true });
    }),
  );
  r.post(
    "/rooms/:id/reports",
    wrap(async (req, res) => {
      const room = await roomAccess(req.user, req.params.id);
      const data = parse(
        z.object({ messageId: objectId, reason: text(1000) }).strict(),
        req.body,
      );
      if (!(await M.Message.exists({ _id: data.messageId, roomId: room._id })))
        fail(404, "Message not found.");
      await M.RoomReport.updateOne(
        { messageId: data.messageId, reporterId: req.user._id },
        {
          $setOnInsert: { ...data, roomId: room._id, reporterId: req.user._id },
        },
        { upsert: true },
      );
      res.status(201).json({ success: true });
    }),
  );
  r.get(
    "/admin/reports",
    admin,
    wrap(async (req, res) => {
      const { page, limit, status } = pagination(req.query),
        filter = { status };
      const [total, reports] = await Promise.all([
        M.RoomReport.countDocuments(filter),
        M.RoomReport.find(filter)
          .sort({ _id: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);
      const messages = await M.Message.find({
        _id: { $in: reports.map((r) => r.messageId) },
      });
      res.json({
        success: true,
        data: reports.map((r) => ({
          ...output(r),
          message: output(messages.find((m) => same(m._id, r.messageId))),
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }),
  );
  r.patch(
    "/admin/reports/:id",
    admin,
    wrap(async (req, res) => {
      const { action } = parse(
        z
          .object({
            action: z.enum([
              "dismiss",
              "remove-message",
              "remove-member",
              "close-room",
            ]),
          })
          .strict(),
        req.body,
      );
      const report = await M.RoomReport.findById(
        parse(objectId, req.params.id),
      );
      if (!report) fail(404, "Report not found.");
      if (report.status !== "open")
        fail(409, "This report has already been reviewed.");
      if (action === "remove-message")
        await M.Message.deleteOne({
          _id: report.messageId,
          roomId: report.roomId,
        });
      if (action === "remove-member") {
        const message = await M.Message.findOne({
          _id: report.messageId,
          roomId: report.roomId,
        });
        if (!message) fail(404, "Message no longer exists.");
        const room = await M.Room.findById(report.roomId);
        if (!room || same(room.ownerId, message.userId))
          fail(409, "A room owner cannot be removed. Close the room instead.");
        const count = room.blockedMembers?.length || 0;
        if (count >= 100)
          fail(409, "Room block list is full. Close the room instead.");
        await M.Room.updateOne(
          { _id: room._id },
          {
            $addToSet: { blockedMembers: message.userId },
            $pull: { members: message.userId },
          },
        );
      }
      if (action === "close-room") {
        const room = await M.Room.findByIdAndUpdate(report.roomId, {
          $set: { closed: true },
        });
        if (room?.scheduledClassId) {
          const scheduled = await M.ScheduledClass.findOneAndUpdate(
            { _id: room.scheduledClassId, cancelled: false },
            { $set: { cancelled: true } },
          );
          if (scheduled)
            await notifyCourse(
              scheduled.courseId,
              "Class cancelled",
              scheduled.title,
            ).catch(() =>
              process.stderr.write("Class notifications unavailable\n"),
            );
        }
      }
      await M.RoomReport.updateOne(
        { _id: report._id },
        {
          $set: {
            status: action === "dismiss" ? "dismissed" : "resolved",
            action,
            resolvedBy: req.user._id,
            resolvedAt: new Date(),
          },
        },
      );
      await M.Audit.create({
        actorId: req.user._id,
        action: "moderation." + action,
        targetId: String(report._id),
      });
      res.json({ success: true });
    }),
  );
  return r;
}
function validateTime(data) {
  const start = new Date(data.startsAt).getTime(),
    end = new Date(data.endsAt).getTime();
  if (
    start < Date.now() - 60000 ||
    end <= start ||
    end - start > 4 * 3600000 ||
    start > Date.now() + 366 * 86400000
  )
    fail(
      400,
      "Choose a future start and an end within four hours. Schedule at most one year ahead.",
    );
}
module.exports = { createCompletion, classAccess };
