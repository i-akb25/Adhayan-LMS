const { sections, validateSections } = require("../lib/assessment");
const express = require("express");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { rateLimit } = require("express-rate-limit");
const M = require("../models");
const { MongoRateStore } = require("../lib/rate-store");
const {
  wrap,
  parse,
  fail,
  text,
  objectId,
  safeUrl,
  publicUser,
} = require("../lib/security");
const { courseAccess, output, question } = require("./learning");
const FILE_LIMIT = 5 * 1024 * 1024;
function fileKey() {
  const hex = process.env.FILE_STORAGE_KEY || "";
  if (!/^[a-f\d]{64}$/i.test(hex))
    fail(503, "Private file storage is not configured.");
  return Buffer.from(hex, "hex");
}
function fileType(data) {
  if (data.subarray(0, 5).toString() === "%PDF-")
    return ["application/pdf", ".pdf"];
  if (
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return ["image/png", ".png"];
  if (data[0] === 255 && data[1] === 216 && data[2] === 255)
    return ["image/jpeg", ".jpg"];
  fail(400, "Only PDF, PNG and JPEG files are accepted.");
}
const lesson = z
  .object({
    title: text(),
    subject: text(100),
    chapter: text(100),
    content: text(50000),
    workedExample: text(10000),
    revisionNotes: text(10000),
    sourceUrl: safeUrl,
    videoUrl: z.union([safeUrl, z.literal("")]).default(""),
    order: z.number().int().min(0).max(10000).default(0),
  })
  .strict();
const curriculum = z
  .object({
    title: text(),
    description: text(5000),
    track: text(150),
    exam: text(100).optional(),
    stage: text(100).optional(),
    syllabusYear: z.number().int().min(2000).max(2100).optional(),
    syllabus: text(10000),
    sources: z.array(safeUrl).min(1).max(20),
    lessons: z.array(lesson).min(1).max(50),
    tests: z
      .array(
        z
          .object({
            title: text(),
            durationMinutes: z.number().int().min(1).max(300),
            questions: z.array(question).min(1).max(200),
            sections,
          })
          .strict(),
      )
      .max(20),
  })
  .strict();
async function storeFile(user, courseId, bytes, query, extra = {}) {
  courseId = String(new (require("mongoose").Types.ObjectId)(courseId));
  if (!Buffer.isBuffer(bytes) || !bytes.length) fail(400, "Choose a file.");
  const { title, name } = parse(
    z.object({ title: text(), name: text(150) }).strict(),
    query,
  );
  const [mime, ext] = fileType(bytes);
  const base =
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[^A-Za-z0-9 _-]/g, "_")
      .slice(0, 100) || "resource";
  const nonce = crypto.randomBytes(12),
    fileId = new (require("mongoose").Types.ObjectId)();
  const cipher = crypto.createCipheriv("aes-256-gcm", fileKey(), nonce);
  cipher.setAAD(Buffer.from(`${fileId}:${courseId}`));
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const reserved = await M.User.findOneAndUpdate(
    {
      _id: user._id,
      $or: [
        { fileBytes: { $exists: false } },
        { fileBytes: { $lte: 100 * 1024 * 1024 - bytes.length } },
      ],
    },
    { $inc: { fileBytes: bytes.length } },
  );
  if (!reserved)
    fail(
      409,
      "Your private-file storage limit is 100 MiB. Remove older unsubmitted files first.",
    );
  try {
    return await M.PrivateFile.create({
      _id: fileId,
      courseId,
      ownerId: user._id,
      title,
      name: base + ext,
      mime,
      size: bytes.length,
      ciphertext,
      nonce,
      tag: cipher.getAuthTag(),
      ...extra,
    });
  } catch (e) {
    await M.User.updateOne(
      { _id: user._id },
      { $inc: { fileBytes: -bytes.length } },
    );
    throw e;
  }
}
async function authorizeFile(user, file) {
  if (
    file.scope === "submission" &&
    String(file.ownerId) !== String(user._id)
  ) {
    await courseAccess(user, file.courseId, true);
    if (
      !(await M.Submission.exists({
        studentId: file.ownerId,
        assignmentId: file.assignmentId,
        fileIds: file._id,
      }))
    )
      fail(403, "This attachment has not been submitted.");
  } else await courseAccess(user, file.courseId);
}
function createOperations(auth, config) {
  const r = express.Router();
  r.get("/public/config", (_req, res) =>
    res.json({
      success: true,
      data: {
        operator: process.env.OPERATOR_NAME || "ADHAYAN operator",
        supportEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          process.env.SUPPORT_EMAIL || "",
        )
          ? process.env.SUPPORT_EMAIL
          : "",
        backupRetentionDays: Math.min(
          365,
          Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS || 30)),
        ),
      },
    }),
  );
  r.use(auth.authenticate);
  const admin = auth.roles("admin"),
    teacher = auth.roles("teacher", "admin");
  r.get("/admin/readiness", admin, (_req, res) =>
    res.json({
      success: true,
      data: {
        https: config.secure,
        email: !!(process.env.MAIL_HOST && process.env.MAIL_FROM_EMAIL),
        ai: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL),
        calls: !!(process.env.TURN_URL && process.env.TURN_SHARED_SECRET),
        privateFiles: /^[a-f\d]{64}$/i.test(process.env.FILE_STORAGE_KEY || ""),
        backups: /^[a-f\d]{64}$/i.test(process.env.BACKUP_KEY || ""),
        support: !!(process.env.OPERATOR_NAME && process.env.SUPPORT_EMAIL),
        adminMfa: /^[A-Z2-7]{32,}$/i.test(process.env.ADMIN_TOTP_SECRET || ""),
        notice:
          "These flags check configuration presence only. Verify provider delivery, calls, scheduled backups and restore separately.",
      },
    }),
  );
  r.get(
    "/institutions",
    wrap(async (req, res) => {
      const memberships = await M.Membership.find({
        userId: req.user._id,
      }).select("institutionId");
      const filter =
        req.user.role === "admin"
          ? {}
          : {
              _id: { $in: memberships.map((m) => m.institutionId) },
              active: true,
            };
      res.json({
        success: true,
        data: (await M.Institution.find(filter).limit(100)).map(output),
      });
    }),
  );
  r.post(
    "/admin/institutions",
    admin,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            name: text(),
            description: z.string().max(2000).default(""),
          })
          .strict(),
        req.body,
      );
      res.status(201).json({
        success: true,
        data: output(await M.Institution.create(data)),
      });
    }),
  );
  r.patch(
    "/admin/institutions/:id",
    admin,
    wrap(async (req, res) => {
      const id = parse(objectId, req.params.id);
      const data = parse(
        z
          .object({
            name: text().optional(),
            description: z.string().max(2000).optional(),
            active: z.boolean().optional(),
          })
          .strict(),
        req.body,
      );
      const institution = await M.Institution.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true },
      );
      if (!institution) fail(404, "Institution not found.");
      res.json({ success: true, data: output(institution) });
    }),
  );
  r.get(
    "/admin/institutions/:id/members",
    admin,
    wrap(async (req, res) => {
      const id = parse(objectId, req.params.id);
      const members = await M.Membership.find({ institutionId: id }).limit(
        1000,
      );
      const users = await M.User.find({
        _id: { $in: members.map((m) => m.userId) },
        isDeleted: { $ne: true },
      });
      res.json({ success: true, data: users.map(publicUser) });
    }),
  );
  r.put(
    "/admin/institutions/:id/members",
    admin,
    wrap(async (req, res) => {
      const institutionId = parse(objectId, req.params.id);
      const { email } = parse(
        z.object({ email: z.string().email().max(254) }).strict(),
        req.body,
      );
      if (!(await M.Institution.exists({ _id: institutionId, active: true })))
        fail(404, "Institution not found.");
      const user = await M.User.findOne({
        email: email.toLowerCase(),
        isDeleted: { $ne: true },
        isActive: true,
      });
      if (!user) fail(404, "Active account not found.");
      await M.Membership.updateOne(
        { institutionId, userId: user._id },
        { $setOnInsert: { institutionId, userId: user._id } },
        { upsert: true },
      );
      res.json({ success: true });
    }),
  );
  r.delete(
    "/admin/institutions/:id/members/:userId",
    admin,
    wrap(async (req, res) => {
      await M.Membership.deleteOne({
        institutionId: parse(objectId, req.params.id),
        userId: parse(objectId, req.params.userId),
      });
      res.json({ success: true });
    }),
  );
  r.post(
    "/curriculum/import",
    teacher,
    wrap(async (req, res) => {
      const data = parse(curriculum, req.body);
      data.tests.forEach(validateSections);
      // Validate the entire package before inserting. Imported courses remain private until an explicit review.
      const course = await M.Course.create({
        title: data.title,
        description: data.description,
        track: data.track,
        exam: data.exam,
        stage: data.stage,
        syllabusYear: data.syllabusYear,
        syllabus: data.syllabus,
        sources: data.sources,
        ownerId: req.user._id,
        reviewRequired: true,
        published: false,
      });
      try {
        await M.Lesson.insertMany(
          data.lessons.map((l) => ({ ...l, courseId: course._id })),
        );
        if (data.tests.length)
          await M.Test.insertMany(
            data.tests.map((t) => ({
              ...t,
              courseId: course._id,
              ownerId: req.user._id,
              published: false,
              questions: t.questions.map((q) => ({
                ...q,
                id: crypto.randomUUID(),
              })),
            })),
          );
      } catch (e) {
        await Promise.all([
          M.Lesson.deleteMany({ courseId: course._id }),
          M.Test.deleteMany({ courseId: course._id }),
        ]);
        await course.deleteOne();
        throw e;
      }
      res.status(201).json({ success: true, data: output(course) });
    }),
  );
  r.get(
    "/courses/:id/review",
    teacher,
    wrap(async (req, res) => {
      const course = await courseAccess(req.user, req.params.id, true);
      res.json({
        success: true,
        data: {
          course: output(course),
          lessons: (
            await M.Lesson.find({ courseId: course._id }).sort({ order: 1 })
          ).map(output),
          tests: (
            await M.Test.find({ courseId: course._id }).select("+questions")
          ).map(output),
        },
      });
    }),
  );
  r.post(
    "/courses/:id/review",
    teacher,
    wrap(async (req, res) => {
      parse(z.object({ confirmed: z.literal(true) }).strict(), req.body);
      const course = await courseAccess(req.user, req.params.id, true);
      if (!(await M.Lesson.exists({ courseId: course._id })))
        fail(409, "Add and review lessons before approval.");
      await M.Course.updateOne(
        { _id: course._id },
        {
          $set: {
            reviewRequired: false,
            reviewedAt: new Date(),
            reviewedBy: req.user._id,
          },
        },
      );
      res.json({ success: true });
    }),
  );
  r.patch(
    "/lessons/:id",
    teacher,
    wrap(async (req, res) => {
      const l = await M.Lesson.findById(parse(objectId, req.params.id));
      if (!l) fail(404, "Lesson not found.");
      await courseAccess(req.user, l.courseId, true);
      const data = parse(lesson.partial(), req.body);
      await M.Lesson.updateOne({ _id: l._id }, { $set: data });
      await invalidateReview(l.courseId);
      res.json({ success: true });
    }),
  );
  r.patch(
    "/tests/:id",
    teacher,
    wrap(async (req, res) => {
      const t = await M.Test.findById(parse(objectId, req.params.id));
      if (!t) fail(404, "Test not found.");
      const course = await courseAccess(req.user, t.courseId, true);
      const data = parse(
        z
          .object({
            title: text().optional(),
            published: z.boolean().optional(),
            durationMinutes: z.number().int().min(1).max(300).optional(),
            questions: z.array(question).min(1).max(200).optional(),
          })
          .strict(),
        req.body,
      );
      if (data.published && course.reviewRequired)
        fail(409, "Review the course before publishing assessments.");
      if (
        t.sections?.length &&
        (data.durationMinutes ||
          (data.questions &&
            data.questions.length !==
              t.sections.reduce((n, s) => n + s.questionCount, 0)))
      )
        fail(
          409,
          "Sectioned assessment structure is fixed. Import a new assessment to change it.",
        );
      if (data.questions) {
        data.questions = data.questions.map((q) => ({
          ...q,
          id: crypto.randomUUID(),
        }));
        data.published = false;
        await invalidateReview(course._id);
      }
      await M.Test.updateOne({ _id: t._id }, { $set: data });
      res.json({ success: true });
    }),
  );
  r.get(
    "/courses/:id/files",
    wrap(async (req, res) => {
      await courseAccess(req.user, req.params.id);
      res.json({
        success: true,
        data: (
          await M.PrivateFile.find({
            courseId: req.params.id,
            scope: { $ne: "submission" },
          }).limit(200)
        ).map(output),
      });
    }),
  );
  const uploadLimit = rateLimit({
    windowMs: 3600000,
    limit: 10,
    keyGenerator: (req) => String(req.user._id),
    ...(config.secure
      ? { store: new MongoRateStore(config.JWT_REFRESH_SECRET, "upload") }
      : {}),
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  r.post(
    "/courses/:id/files",
    teacher,
    uploadLimit,
    wrap(async (req, _res, next) => {
      await courseAccess(req.user, req.params.id, true);
      fileKey();
      next();
    }),
    express.raw({ type: "application/octet-stream", limit: FILE_LIMIT }),
    wrap(async (req, res) => {
      const f = await storeFile(req.user, req.params.id, req.body, req.query);
      res.status(201).json({
        success: true,
        data: {
          id: String(f._id),
          title: f.title,
          name: f.name,
          size: f.size,
        },
      });
    }),
  );
  r.post(
    "/assignments/:id/files",
    auth.roles("student"),
    uploadLimit,
    wrap(async (req, _res, next) => {
      const assignment = await M.Assignment.findById(
        parse(objectId, req.params.id),
      );
      if (!assignment) fail(404, "Assignment not found.");
      await courseAccess(req.user, assignment.courseId);
      if (assignment.dueAt && Date.now() > assignment.dueAt.getTime())
        fail(409, "The assignment deadline has passed.");
      if (
        await M.Submission.exists({
          assignmentId: assignment._id,
          studentId: req.user._id,
        })
      )
        fail(409, "Assignment already submitted.");
      if (
        (await M.PrivateFile.countDocuments({
          assignmentId: assignment._id,
          ownerId: req.user._id,
          scope: "submission",
        })) >= 10
      )
        fail(409, "Remove an older unsubmitted attachment first.");
      req.assignment = assignment;
      fileKey();
      next();
    }),
    express.raw({ type: "application/octet-stream", limit: FILE_LIMIT }),
    wrap(async (req, res) => {
      const f = await storeFile(
        req.user,
        req.assignment.courseId,
        req.body,
        req.query,
        { scope: "submission", assignmentId: req.assignment._id },
      );
      res.status(201).json({
        success: true,
        data: {
          id: String(f._id),
          name: f.name,
          title: f.title,
          size: f.size,
        },
      });
    }),
  );
  r.get(
    "/assignments/:id/files",
    auth.roles("student"),
    wrap(async (req, res) => {
      const assignment = await M.Assignment.findById(
        parse(objectId, req.params.id),
      );
      if (!assignment) fail(404, "Assignment not found.");
      await courseAccess(req.user, assignment.courseId);
      res.json({
        success: true,
        data: (
          await M.PrivateFile.find({
            assignmentId: assignment._id,
            ownerId: req.user._id,
            scope: "submission",
          }).limit(30)
        ).map(output),
      });
    }),
  );
  r.get(
    "/files/:id/meta",
    wrap(async (req, res) => {
      const file = await M.PrivateFile.findById(parse(objectId, req.params.id));
      if (!file) fail(404, "File not found.");
      await authorizeFile(req.user, file);
      res.json({ success: true, data: output(file) });
    }),
  );
  r.get(
    "/files/:id/download",
    wrap(async (req, res) => {
      const f = await M.PrivateFile.findById(
        parse(objectId, req.params.id),
      ).select("+ciphertext +nonce +tag");
      if (!f) fail(404, "File not found.");
      await authorizeFile(req.user, f);
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        fileKey(),
        f.nonce,
      );
      decipher.setAAD(Buffer.from(`${f._id}:${f.courseId}`));
      decipher.setAuthTag(f.tag);
      const data = Buffer.concat([
        decipher.update(f.ciphertext),
        decipher.final(),
      ]);
      res
        .set({
          "Content-Type": f.mime,
          "Content-Disposition": `attachment; filename="${f.name}"`,
          "Content-Security-Policy": "sandbox; default-src 'none'",
          "X-Content-Type-Options": "nosniff",
        })
        .send(data);
    }),
  );
  r.delete(
    "/files/:id",
    wrap(async (req, res) => {
      const f = await M.PrivateFile.findById(parse(objectId, req.params.id));
      if (!f) fail(404, "File not found.");
      if (f.scope === "submission") {
        if (String(f.ownerId) !== String(req.user._id))
          fail(403, "Only the uploader can delete an unsubmitted attachment.");
        if (
          await M.Submission.exists({ studentId: req.user._id, fileIds: f._id })
        )
          fail(409, "Submitted attachments cannot be removed.");
        await authorizeFile(req.user, f);
      } else await courseAccess(req.user, f.courseId, true);
      const deleted = await M.PrivateFile.deleteOne({ _id: f._id });
      if (deleted.deletedCount)
        await M.User.updateOne(
          { _id: f.ownerId },
          { $inc: { fileBytes: -f.size } },
        );
      res.json({ success: true });
    }),
  );
  r.get(
    "/account/export",
    wrap(async (req, res) => {
      const uid = req.user._id;
      const filters = {
        Enrollment: { studentId: uid },
        Progress: { studentId: uid },
        Attempt: { studentId: uid },
        Submission: { studentId: uid },
        Attendance: { studentId: uid },
        Plan: { studentId: uid },
        ParentLink: { $or: [{ parentId: uid }, { studentId: uid }] },
        Notification: { userId: uid },
        Membership: { userId: uid },
        Message: { userId: uid },
        PrivateFile: { ownerId: uid },
        RoomReport: { reporterId: uid },
        ScheduledClass: { ownerId: uid },
      };
      const records = {};
      for (const [name, filter] of Object.entries(filters)) {
        const docs = await M[name].find(filter).limit(10001);
        if (docs.length > 10000)
          fail(
            413,
            "Export is too large. Contact support for a complete export.",
          );
        records[name] = docs.map(output);
      }
      // Private answers/explanations from an in-progress assessment must never appear in an export.
      res
        .set(
          "Content-Disposition",
          'attachment; filename="adhayan-account.json"',
        )
        .json({
          version: 1,
          exportedAt: new Date(),
          user: publicUser(req.user),
          records,
        });
    }),
  );
  r.delete(
    "/account",
    wrap(async (req, res) => {
      const { password, confirmation } = parse(
        z
          .object({
            password: text(128),
            confirmation: z.literal("DELETE MY ACCOUNT"),
          })
          .strict(),
        req.body,
      );
      const u = await M.User.findById(req.user._id).select("+password");
      if (u.role === "admin")
        fail(
          403,
          "Transfer administration before requesting deletion through support.",
        );
      if (!(await bcrypt.compare(password, u.password)))
        fail(400, "Current password is incorrect.");
      // Revoke first. Retrying deletion is possible only after an administrator resolves a failed cleanup.
      await M.User.updateOne(
        { _id: u._id },
        {
          $set: { isActive: false, deletionRequestedAt: new Date() },
          $inc: { tokenVersion: 1 },
        },
      );
      await M.Session.deleteMany({ userId: u._id });
      await purgeAccount(u._id);
      res.clearCookie("adhayan_session", { path: "/" });
      res.clearCookie("adhayan_refresh", { path: "/" });
      res.clearCookie("adhayan_csrf", { path: "/" });
      res.json({ success: true });
    }),
  );
  return r;
}
async function invalidateReview(courseId) {
  const course = await M.Course.findById(courseId);
  if (course?.sources?.length) {
    await M.Course.updateOne(
      { _id: courseId },
      {
        $set: { reviewRequired: true, published: false },
        $unset: { reviewedAt: 1, reviewedBy: 1 },
      },
    );
    await M.Test.updateMany({ courseId }, { $set: { published: false } });
  }
}
async function purgeAccount(uid) {
  const privateRooms = await M.Room.find({
    kind: "parent-teacher",
    $or: [{ parentId: uid }, { studentId: uid }, { ownerId: uid }],
  }).select("_id");
  await M.Message.deleteMany({
    $or: [{ userId: uid }, { roomId: { $in: privateRooms.map((r) => r._id) } }],
  });
  await M.Room.updateMany({ members: uid }, { $pull: { members: uid } });
  await M.Room.updateMany(
    { _id: { $in: privateRooms.map((r) => r._id) } },
    { $set: { closed: true } },
  );
  for (const name of [
    "Enrollment",
    "Progress",
    "Attempt",
    "Submission",
    "Attendance",
    "Plan",
  ])
    await M[name].deleteMany({ studentId: uid });
  await M.ParentLink.deleteMany({
    $or: [{ parentId: uid }, { studentId: uid }],
  });
  for (const name of ["Session", "ActionToken", "Membership", "Notification"])
    await M[name].deleteMany({ userId: uid });
  const classes = await M.ScheduledClass.find({ ownerId: uid }).select(
    "roomId",
  );
  await M.ScheduledClass.updateMany(
    { ownerId: uid },
    { $set: { cancelled: true } },
  );
  await M.Room.updateMany(
    { _id: { $in: classes.map((c) => c.roomId) } },
    { $set: { closed: true } },
  );
  await M.RoomReport.updateMany(
    { resolvedBy: uid },
    { $unset: { resolvedBy: 1 } },
  );
  await M.PrivateFile.deleteMany({ ownerId: uid });
  await M.RoomReport.deleteMany({ reporterId: uid });
  await M.Audit.updateMany({ actorId: uid }, { $unset: { actorId: 1 } });
  await M.User.updateOne(
    { _id: uid },
    {
      $set: {
        name: "Deleted account",
        email: `deleted-${crypto.randomUUID()}@invalid.example`,
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
        isActive: false,
        isDeleted: true,
        status: "deleted",
        fileBytes: 0,
        bio: "",
        phone: "",
        avatar: "",
        track: "",
      },
      $unset: {
        username: 1,
        firstName: 1,
        middleName: 1,
        lastName: 1,
        consentedAt: 1,
        deletionRequestedAt: 1,
      },
    },
  );
}
module.exports = {
  createOperations,
  purgeAccount,
  curriculum,
  invalidateReview,
};
