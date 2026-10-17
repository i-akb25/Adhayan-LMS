const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { z } = require("zod");
const { User, Session, ActionToken, Audit } = require("../models");
const {
  HttpError,
  hash,
  token,
  fail,
  wrap,
  parse,
  text,
  password,
  publicUser,
  verifyTotp,
} = require("../lib/security");
const cookieNames = {
  access: "adhayan_session",
  refresh: "adhayan_refresh",
  csrf: "adhayan_csrf",
};
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
const accessLifetime = 15 * 60 * 1000;
function cookies(res, config, values) {
  const common = { secure: config.secure, sameSite: "strict", path: "/" };
  res.cookie(cookieNames.access, values.access, {
    ...common,
    httpOnly: true,
    maxAge: accessLifetime,
  });
  res.cookie(cookieNames.refresh, values.refresh, {
    ...common,
    httpOnly: true,
    maxAge: sessionLifetime,
  });
  res.cookie(cookieNames.csrf, values.csrf, {
    ...common,
    httpOnly: false,
    maxAge: sessionLifetime,
  });
}
function clearCookies(res, config) {
  for (const name of Object.values(cookieNames))
    res.clearCookie(name, {
      secure: config.secure,
      sameSite: "strict",
      path: "/",
    });
}
const digest = (value, secret) =>
  crypto.createHmac("sha256", secret).update(value).digest("hex");
function createAuth(config) {
  const accessHash = (value) => digest(value, config.JWT_ACCESS_SECRET);
  const refreshHash = (value) => digest(value, config.JWT_REFRESH_SECRET);
  const router = express.Router();
  const authenticate = wrap(async (req, res, next) => {
    const value = req.cookies[cookieNames.access];
    if (!value || typeof value !== "string" || value.length > 128)
      fail(401, "Please sign in.");
    const session = await Session.findOne({
      accessHash: accessHash(value),
      revokedAt: null,
      accessExpiresAt: { $gt: new Date() },
      expiresAt: { $gt: new Date() },
    }).select("+csrfHash");
    if (!session) fail(401, "Session expired. Please sign in.");
    const user = await User.findOne({
      _id: session.userId,
      isDeleted: { $ne: true },
      isActive: { $ne: false },
    });
    if (
      !user ||
      ["locked", "suspended", "banned", "inactive", "deleted"].includes(
        user.status?.toLowerCase(),
      ) ||
      session.version !== user.tokenVersion
    )
      fail(401, "Session is unavailable.");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      hash(req.get("X-CSRF-Token") || "") !== session.csrfHash
    )
      fail(403, "Request verification failed. Refresh the page.");
    req.user = user;
    req.session = session;
    next();
  });
  const roles =
    (...allowed) =>
    (req, res, next) =>
      allowed.includes(req.user.role)
        ? next()
        : next(new HttpError(403, "Access denied."));
  async function issue(user, res) {
    const values = { access: token(), refresh: token(), csrf: token() };
    await Session.create({
      userId: user._id,
      accessHash: accessHash(values.access),
      refreshHash: refreshHash(values.refresh),
      csrfHash: hash(values.csrf),
      accessExpiresAt: new Date(Date.now() + accessLifetime),
      expiresAt: new Date(Date.now() + sessionLifetime),
      version: user.tokenVersion,
    });
    cookies(res, config, values);
    return publicUser(user);
  }
  async function sendAction(user, purpose) {
    if (!process.env.MAIL_HOST || !process.env.MAIL_FROM_EMAIL)
      fail(503, "Email service is not configured.");
    const raw = token();
    const record = await ActionToken.create({
      userId: user._id,
      hash: hash(raw),
      purpose,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const nodemailer = require("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === "true",
      ...(process.env.MAIL_USER
        ? { auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } }
        : {}),
    });
    const url = new URL(
      purpose === "verify" ? "/verify-email" : "/reset-password",
      config.origins[0],
    );
    url.hash = raw;
    try {
      await transport.sendMail({
        from: process.env.MAIL_FROM_EMAIL,
        to: user.email,
        subject:
          purpose === "verify"
            ? "Verify your ADHAYAN email"
            : "Reset your ADHAYAN password",
        text: `Open this link within 30 minutes: ${url.toString()}\nIf you did not request this, ignore it.`,
      });
    } catch {
      await ActionToken.deleteOne({ _id: record._id });
      fail(503, "Email delivery is unavailable. Try again later.");
    }
  }
  router.post(
    "/register",
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            name: text(100),
            email: z
              .string()
              .email()
              .max(254)
              .transform((s) => s.toLowerCase()),
            password,
            confirmPassword: z.string().optional(),
            phone: z.string().max(30).optional(),
            role: z
              .enum(["Student", "Parent", "student", "parent"])
              .default("Student"),
            consent: z.literal(true),
            profileData: z
              .object({
                class: text(50).optional(),
                target: text(100).optional(),
                stream: text(100).optional(),
              })
              .optional(),
          })
          .strict(),
        req.body,
      );
      if (await User.exists({ email: data.email }))
        fail(409, "An account already uses this email.");
      const user = await User.create({
        name: data.name,
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" "),
        username: "u_" + crypto.randomBytes(8).toString("hex"),
        email: data.email,
        password: await bcrypt.hash(data.password, 12),
        role: data.role.toLowerCase(),
        phone: data.phone,
        track:
          data.role.toLowerCase() === "student"
            ? [data.profileData?.class, data.profileData?.target]
                .filter(Boolean)
                .join(" · ")
            : "",
        consentedAt: new Date(),
      });
      const safe = await issue(user, res);
      await Audit.create({ actorId: user._id, action: "account.created" });
      res.status(201).json({ success: true, user: safe });
    }),
  );
  router.post(
    "/login",
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            email: z
              .string()
              .email()
              .max(254)
              .transform((s) => s.toLowerCase()),
            password: z.string().min(1).max(128),
            totp: z.string().max(6).optional(),
          })
          .strict(),
        req.body,
      );
      const user = await User.findOne({ email: data.email }).select(
        "+password",
      );
      // A fixed-cost comparison also runs for unknown accounts.
      const dummy =
        "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5vAqM4NMu9QnRgWJX7Fq8qKxS8MSe2K";
      const valid = await bcrypt.compare(
        data.password,
        user?.password || dummy,
      );
      if (
        !user ||
        !valid ||
        user.isDeleted ||
        !user.isActive ||
        (user.lockUntil && user.lockUntil > Date.now()) ||
        ["locked", "suspended", "banned", "inactive", "deleted"].includes(
          user.status?.toLowerCase(),
        )
      ) {
        if (user) {
          const failed = (user.failedLoginAttempts || 0) + 1;
          await User.updateOne(
            { _id: user._id },
            {
              $set: {
                failedLoginAttempts: failed,
                ...(failed >= 5
                  ? { lockUntil: new Date(Date.now() + 15 * 60 * 1000) }
                  : {}),
              },
            },
          );
        }
        fail(401, "Invalid credentials or account unavailable.");
      }
      if (
        user.role === "admin" &&
        !verifyTotp(process.env.ADMIN_TOTP_SECRET, data.totp)
      )
        fail(401, "Administrator verification code required.");
      if (user.role === "admin") {
        try {
          await ActionToken.create({
            userId: user._id,
            hash: hash(String(user._id) + ":mfa:" + data.totp),
            purpose: "mfa",
            expiresAt: new Date(Date.now() + 90000),
          });
        } catch (e) {
          if (e.code === 11000)
            fail(401, "Administrator verification code already used.");
          throw e;
        }
      }
      await User.updateOne(
        { _id: user._id },
        { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } },
      );
      res.json({ success: true, user: await issue(user, res) });
    }),
  );
  const refresh = wrap(async (req, res) => {
    const raw = req.cookies[cookieNames.refresh];
    if (!raw || typeof raw !== "string" || raw.length > 128)
      fail(401, "Session expired.");
    const previous = await Session.findOne({
      refreshHash: refreshHash(raw),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).select("+csrfHash");
    if (!previous || hash(req.get("X-CSRF-Token") || "") !== previous.csrfHash)
      fail(401, "Session expired.");
    const user = await User.findOne({
      _id: previous.userId,
      isActive: true,
      isDeleted: { $ne: true },
    });
    if (
      !user ||
      user.tokenVersion !== previous.version ||
      ["locked", "suspended", "banned", "inactive", "deleted"].includes(
        user.status?.toLowerCase(),
      )
    )
      fail(401, "Session expired.");
    const values = { access: token(), refresh: token(), csrf: token() };
    const updated = await Session.findOneAndUpdate(
      { _id: previous._id, refreshHash: refreshHash(raw), revokedAt: null },
      {
        $set: {
          accessHash: accessHash(values.access),
          refreshHash: refreshHash(values.refresh),
          csrfHash: hash(values.csrf),
          accessExpiresAt: new Date(Date.now() + accessLifetime),
        },
      },
    );
    if (!updated) fail(401, "Session already refreshed.");
    cookies(res, config, values);
    res.json({ success: true, user: publicUser(user) });
  });
  router.post(["/refresh", "/refresh-token"], refresh);
  router.get(["/me", "/profile"], authenticate, (req, res) =>
    res.json({ success: true, user: publicUser(req.user) }),
  );
  router.post(
    "/logout",
    wrap(async (req, res) => {
      const raw = req.cookies[cookieNames.refresh];
      if (raw) {
        const s = await Session.findOne({
          refreshHash: refreshHash(raw),
        }).select("+csrfHash");
        if (s && hash(req.get("X-CSRF-Token") || "") !== s.csrfHash)
          fail(403, "Request verification failed.");
        if (s)
          await Session.updateOne(
            { _id: s._id },
            { $set: { revokedAt: new Date() } },
          );
      }
      clearCookies(res, config);
      res.json({ success: true });
    }),
  );
  router.post(
    "/logout-all",
    authenticate,
    wrap(async (req, res) => {
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { tokenVersion: 1 } },
      );
      await Session.updateMany(
        { userId: req.user._id },
        { $set: { revokedAt: new Date() } },
      );
      clearCookies(res, config);
      res.json({ success: true });
    }),
  );
  router.get(
    "/sessions",
    authenticate,
    wrap(async (req, res) => {
      const data = await Session.find({
        userId: req.user._id,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
        .select("_id createdAt")
        .limit(50);
      res.json({
        success: true,
        data: data.map((s) => ({
          id: String(s._id),
          createdAt: s.createdAt,
          current: s._id.equals(req.session._id),
        })),
      });
    }),
  );
  router.delete(
    "/sessions/:id",
    authenticate,
    wrap(async (req, res) => {
      if (!/^[a-f\d]{24}$/i.test(req.params.id)) fail(400, "Invalid session.");
      await Session.updateOne(
        { _id: req.params.id, userId: req.user._id },
        { $set: { revokedAt: new Date() } },
      );
      res.json({ success: true });
    }),
  );
  router.post(
    "/forgot-password",
    wrap(async (req, res) => {
      const { email } = parse(
        z.object({ email: z.string().email().max(254) }).strict(),
        req.body,
      );
      if (!process.env.MAIL_HOST) fail(503, "Email service is not configured.");
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) await sendAction(user, "reset");
      res.json({
        success: true,
        message: "If an account exists, a reset email will be sent.",
      });
    }),
  );
  router.post(
    "/resend-verification",
    authenticate,
    wrap(async (req, res) => {
      if (!req.user.emailVerified) await sendAction(req.user, "verify");
      res.json({ success: true });
    }),
  );
  router.post(
    "/verify-email",
    wrap(async (req, res) => {
      const { token: raw } = parse(
        z.object({ token: text(128) }).strict(),
        req.body,
      );
      const t = await ActionToken.findOneAndUpdate(
        {
          hash: hash(raw),
          purpose: "verify",
          usedAt: null,
          expiresAt: { $gt: new Date() },
        },
        { $set: { usedAt: new Date() } },
      );
      if (!t) fail(400, "Link is invalid or expired.");
      await User.updateOne(
        { _id: t.userId },
        { $set: { emailVerified: true } },
      );
      res.json({ success: true });
    }),
  );
  router.post(
    "/reset-password",
    wrap(async (req, res) => {
      const data = parse(
        z.object({ token: text(128), password }).strict(),
        req.body,
      );
      const t = await ActionToken.findOneAndUpdate(
        {
          hash: hash(data.token),
          purpose: "reset",
          usedAt: null,
          expiresAt: { $gt: new Date() },
        },
        { $set: { usedAt: new Date() } },
      );
      if (!t) fail(400, "Link is invalid or expired.");
      await User.updateOne(
        { _id: t.userId },
        {
          $set: { password: await bcrypt.hash(data.password, 12) },
          $inc: { tokenVersion: 1 },
        },
      );
      await Session.updateMany(
        { userId: t.userId },
        { $set: { revokedAt: new Date() } },
      );
      res.json({ success: true });
    }),
  );
  router.post(
    "/change-password",
    authenticate,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({ currentPassword: text(128), newPassword: password })
          .strict(),
        req.body,
      );
      const user = await User.findById(req.user._id).select("+password");
      if (!(await bcrypt.compare(data.currentPassword, user.password)))
        fail(400, "Current password is incorrect.");
      await User.updateOne(
        { _id: user._id },
        {
          $set: { password: await bcrypt.hash(data.newPassword, 12) },
          $inc: { tokenVersion: 1 },
        },
      );
      await Session.updateMany(
        { userId: user._id },
        { $set: { revokedAt: new Date() } },
      );
      clearCookies(res, config);
      res.json({ success: true });
    }),
  );
  return { router, authenticate, roles, accessHash };
}
module.exports = { createAuth, cookieNames };
