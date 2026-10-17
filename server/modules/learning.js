const {
  sections,
  validateSections,
  activeSection,
  mergeAnswers,
} = require("../lib/assessment");
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
  safeUrl,
  hash,
  token,
  grade,
  publicUser,
} = require("../lib/security");
const id = (value) => parse(objectId, String(value));
const same = (a, b) => String(a) === String(b);
const output = (doc) => {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : { ...doc };
  d.id = String(d._id);
  delete d.__v;
  delete d._id;
  return d;
};
const answerSchema = z
  .record(z.string().max(100), z.number().int().min(0).max(7).nullable())
  .refine((a) => Object.keys(a).length <= 200);
const question = z
  .object({
    prompt: text(3000),
    options: z.array(text(1000)).min(2).max(8),
    correctIndex: z.number().int().min(0).max(7),
    explanation: text(5000),
    topic: text(100),
    marks: z.number().min(0.25).max(100).default(1),
    negativeMarks: z.number().min(0).max(100).default(0),
  })
  .strict()
  .refine((q) => q.correctIndex < q.options.length);
async function courseAccess(user, courseId, write = false) {
  const c = await M.Course.findById(id(courseId));
  if (!c) fail(404, "Course not found.");
  if (user.role === "admin") return c;
  if (
    c.institutionId &&
    !(
      (await M.Institution.exists({ _id: c.institutionId, active: true })) &&
      (await M.Membership.exists({
        institutionId: c.institutionId,
        userId: user._id,
      }))
    )
  )
    fail(403, "Institution membership is required.");
  if (same(c.ownerId, user._id) && user.role === "teacher") return c;
  if (write) fail(403, "Only the course owner can change this content.");
  if (
    user.role !== "student" ||
    c.track !== user.track ||
    !c.published ||
    !(await M.Enrollment.exists({ studentId: user._id, courseId: c._id }))
  )
    fail(403, "Course access denied.");
  return c;
}
async function studentAccess(user, studentId) {
  id(studentId);
  if (same(user._id, studentId)) return;
  if (user.role === "admin") return;
  if (
    user.role === "parent" &&
    (await M.ParentLink.exists({ parentId: user._id, studentId }))
  )
    return;
  if (user.role === "teacher") {
    const courses = await accessibleCourseIds(
      user,
      (await M.Course.find({ ownerId: user._id }).select("_id")).map(
        (c) => c._id,
      ),
    );
    if (
      await M.Enrollment.exists({
        studentId,
        courseId: { $in: courses },
      })
    )
      return;
  }
  fail(403, "Student report access denied.");
}
async function roomAccess(user, roomId) {
  const room = await M.Room.findById(id(roomId));
  if (!room || room.closed) fail(404, "Room not found.");
  if (!room.members.some((m) => same(m, user._id)))
    fail(403, "Join the room first.");
  if (
    room.kind === "parent-teacher" &&
    !(await M.ParentLink.exists({
      parentId: room.parentId,
      studentId: room.studentId,
    }))
  )
    fail(403, "Parent access has been revoked.");
  if (room.courseId) await courseAccess(user, room.courseId);
  return room;
}
async function analytics(studentId, courseIds = null) {
  const filter = {
    studentId,
    ...(courseIds ? { courseId: { $in: courseIds } } : {}),
  };
  const [attempts, progress, attendance] = await Promise.all([
    M.Attempt.find({ ...filter, submittedAt: { $ne: null } })
      .select("result testId createdAt")
      .limit(100),
    M.Progress.countDocuments({ ...filter, completed: true }),
    M.Attendance.find(filter).select("status").limit(1000),
  ]);
  const topics = {};
  for (const a of attempts)
    for (const t of a.result?.topics || []) {
      const row = (topics[t.topic] ||= {
        topic: t.topic,
        correct: 0,
        total: 0,
      });
      row.correct += t.correct;
      row.total += t.total;
    }
  const topicScores = Object.values(topics).map((t) => ({
    ...t,
    accuracy: Math.round((t.correct / t.total) * 100),
  }));
  return {
    testsCompleted: attempts.length,
    completedLessons: progress,
    averageScore: attempts.length
      ? Math.round(
          attempts.reduce((n, a) => n + (a.result?.percentage || 0), 0) /
            attempts.length,
        )
      : null,
    attendance: attendance.length
      ? Math.round(
          (attendance.filter((a) => a.status !== "Absent").length /
            attendance.length) *
            100,
        )
      : null,
    topics: topicScores,
    weakTopics: topicScores.filter((t) => t.accuracy < 60).map((t) => t.topic),
    results: attempts.map(output),
  };
}
async function accessibleCourseIds(user, ids) {
  const allowed = [];
  for (const value of ids) {
    try {
      await courseAccess(user, value);
      allowed.push(value);
    } catch (e) {
      if (![403, 404].includes(e.status)) throw e;
    }
  }
  return allowed;
}
function createLearning(auth) {
  const r = express.Router();
  r.use(auth.authenticate);
  const teacher = auth.roles("teacher", "admin");
  const student = auth.roles("student");
  r.put(
    "/users/profile",
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            name: text(100).optional(),
            phone: z.string().max(30).optional(),
            bio: z.string().max(1000).optional(),
            theme: z.enum(["light", "dark", "system"]).optional(),
          })
          .strict(),
        req.body,
      );
      const user = await M.User.findByIdAndUpdate(
        req.user._id,
        { $set: data },
        { new: true, runValidators: true },
      );
      res.json({ success: true, user: publicUser(user) });
    }),
  );
  r.put(
    "/users/track",
    student,
    wrap(async (req, res) => {
      const { track } = parse(
        z.object({ track: text(150) }).strict(),
        req.body,
      );
      if (req.user.track && req.user.track !== track)
        fail(
          409,
          "You already have an active learning track. Ask an administrator to change it.",
        );
      const u = await M.User.findOneAndUpdate(
        {
          _id: req.user._id,
          $or: [{ track: { $exists: false } }, { track: "" }, { track }],
        },
        { $set: { track } },
        { new: true },
      );
      if (!u) fail(409, "An active track already exists.");
      res.json({ success: true, user: publicUser(u) });
    }),
  );
  r.get(
    "/courses",
    wrap(async (req, res) => {
      const filter =
        req.user.role === "admin"
          ? {}
          : req.user.role === "teacher"
            ? { ownerId: req.user._id }
            : {
                published: true,
                ...(req.user.track ? { track: req.user.track } : {}),
              };
      if (req.user.role !== "admin") {
        const active = await M.Institution.find({ active: true }).select("_id");
        const memberships = await M.Membership.find({
          userId: req.user._id,
          institutionId: { $in: active.map((i) => i._id) },
        });
        filter.$or = [
          { institutionId: { $exists: false } },
          { institutionId: null },
          { institutionId: { $in: memberships.map((m) => m.institutionId) } },
        ];
      }
      const data = await M.Course.find(filter)
        .sort({ createdAt: -1 })
        .limit(100);
      const enrollments = await M.Enrollment.find({
        studentId: req.user._id,
      }).select("courseId");
      res.json({
        success: true,
        data: data.map((c) => ({
          ...output(c),
          enrolled: enrollments.some((e) => same(e.courseId, c._id)),
        })),
      });
    }),
  );
  r.post(
    "/courses",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            title: text(),
            description: z.string().max(5000).default(""),
            track: text(150),
            institutionId: objectId.optional(),
            published: z.boolean().default(false),
          })
          .strict(),
        req.body,
      );
      if (data.institutionId) {
        if (
          !(await M.Institution.exists({
            _id: data.institutionId,
            active: true,
          }))
        )
          fail(404, "Institution not found.");
        if (
          req.user.role !== "admin" &&
          !(await M.Membership.exists({
            institutionId: data.institutionId,
            userId: req.user._id,
          }))
        )
          fail(403, "Institution membership is required.");
      }
      res.status(201).json({
        success: true,
        data: output(await M.Course.create({ ...data, ownerId: req.user._id })),
      });
    }),
  );
  r.patch(
    "/courses/:id",
    teacher,
    wrap(async (req, res) => {
      const existing = await courseAccess(req.user, req.params.id, true);
      const data = parse(
        z
          .object({
            title: text().optional(),
            description: z.string().max(5000).optional(),
            published: z.boolean().optional(),
          })
          .strict(),
        req.body,
      );
      if (data.published && existing.reviewRequired)
        fail(409, "Review the imported content before publishing.");
      res.json({
        success: true,
        data: output(
          await M.Course.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true },
          ),
        ),
      });
    }),
  );
  r.post(
    "/courses/:id/enroll",
    student,
    wrap(async (req, res) => {
      const c = await M.Course.findById(id(req.params.id));
      if (!c?.published) fail(404, "Course not found.");
      if (!req.user.track || c.track !== req.user.track)
        fail(409, "Choose the matching active learning track first.");
      if (
        c.institutionId &&
        !(
          (await M.Institution.exists({
            _id: c.institutionId,
            active: true,
          })) &&
          (await M.Membership.exists({
            institutionId: c.institutionId,
            userId: req.user._id,
          }))
        )
      )
        fail(403, "Institution membership is required.");
      await M.Enrollment.updateOne(
        { studentId: req.user._id, courseId: c._id },
        { $setOnInsert: { studentId: req.user._id, courseId: c._id } },
        { upsert: true },
      );
      res.json({ success: true });
    }),
  );
  r.get(
    "/courses/:id/lessons",
    wrap(async (req, res) => {
      await courseAccess(req.user, req.params.id);
      const [lessons, progress] = await Promise.all([
        M.Lesson.find({ courseId: req.params.id })
          .sort({ order: 1 })
          .limit(200),
        M.Progress.find({
          courseId: req.params.id,
          studentId: req.user._id,
        }).limit(200),
      ]);
      res.json({
        success: true,
        data: lessons.map((l) => ({
          ...output(l),
          progress: output(progress.find((p) => same(p.lessonId, l._id))),
        })),
      });
    }),
  );
  r.post(
    "/courses/:id/lessons",
    teacher,
    wrap(async (req, res) => {
      await courseAccess(req.user, req.params.id, true);
      const data = parse(
        z
          .object({
            title: text(),
            chapter: text(100),
            subject: text(100),
            content: text(50000),
            videoUrl: z.union([safeUrl, z.literal("")]).default(""),
            order: z.number().int().min(0).max(10000).default(0),
            workedExample: z.string().max(10000).default(""),
            revisionNotes: z.string().max(10000).default(""),
            sourceUrl: z.union([safeUrl, z.literal("")]).default(""),
          })
          .strict(),
        req.body,
      );
      await require("./operations").invalidateReview(req.params.id);
      res.status(201).json({
        success: true,
        data: output(
          await M.Lesson.create({ ...data, courseId: req.params.id }),
        ),
      });
    }),
  );
  r.put(
    "/lessons/:id/progress",
    student,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            completed: z.boolean(),
            notes: z.string().max(20000).default(""),
          })
          .strict(),
        req.body,
      );
      const l = await M.Lesson.findById(id(req.params.id));
      if (!l) fail(404, "Lesson not found.");
      await courseAccess(req.user, l.courseId);
      const p = await M.Progress.findOneAndUpdate(
        { studentId: req.user._id, lessonId: l._id },
        { $set: { ...data, courseId: l.courseId } },
        { new: true, upsert: true, runValidators: true },
      );
      res.json({ success: true, data: output(p) });
    }),
  );
  r.get(
    "/materials",
    wrap(async (req, res) => {
      let ids;
      if (req.query.courseId) {
        await courseAccess(req.user, String(req.query.courseId));
        ids = [req.query.courseId];
      } else if (req.user.role === "admin") {
        ids = (await M.Course.find().select("_id").limit(100)).map(
          (c) => c._id,
        );
      } else if (req.user.role === "teacher") {
        ids = (
          await M.Course.find({ ownerId: req.user._id }).select("_id")
        ).map((c) => c._id);
      } else {
        ids = (
          await M.Enrollment.find({ studentId: req.user._id }).select(
            "courseId",
          )
        ).map((e) => e.courseId);
      }
      ids = await accessibleCourseIds(req.user, ids);
      res.json({
        success: true,
        data: (
          await M.Material.find({ courseId: { $in: ids } }).limit(200)
        ).map(output),
      });
    }),
  );
  r.post(
    "/materials",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            courseId: objectId,
            title: text(),
            type: z.enum(["PDF", "Video", "Link"]),
            url: safeUrl,
          })
          .strict(),
        req.body,
      );
      await courseAccess(req.user, data.courseId, true);
      res.status(201).json({
        success: true,
        data: output(
          await M.Material.create({ ...data, ownerId: req.user._id }),
        ),
      });
    }),
  );
  r.delete(
    "/materials/:id",
    teacher,
    wrap(async (req, res) => {
      const m = await M.Material.findById(id(req.params.id));
      if (!m) fail(404, "Material not found.");
      await courseAccess(req.user, m.courseId, true);
      await m.deleteOne();
      res.json({ success: true });
    }),
  );
  r.get(
    ["/tests", "/tests/diagnostic"],
    wrap(async (req, res) => {
      let courses;
      if (req.query.courseId) {
        await courseAccess(req.user, String(req.query.courseId));
        courses = [req.query.courseId];
      } else
        courses = (
          req.user.role === "teacher"
            ? await M.Course.find({ ownerId: req.user._id }).select("_id")
            : req.user.role === "admin"
              ? await M.Course.find().select("_id")
              : await M.Enrollment.find({ studentId: req.user._id }).select(
                  "courseId",
                )
        ).map((c) => c.courseId || c._id);
      courses = await accessibleCourseIds(req.user, courses);
      const data = await M.Test.find({
        courseId: { $in: courses },
        ...(req.user.role === "student" ? { published: true } : {}),
      }).limit(100);
      res.json({ success: true, data: data.map(output) });
    }),
  );
  r.post(
    "/tests",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            courseId: objectId,
            title: text(),
            durationMinutes: z.number().int().min(1).max(300),
            published: z.boolean().default(false),
            questions: z.array(question).min(1).max(200),
            sections,
          })
          .strict(),
        req.body,
      );
      await courseAccess(req.user, data.courseId, true);
      validateSections(data);
      const test = await M.Test.create({
        ...data,
        ownerId: req.user._id,
        questions: data.questions.map((q) => ({
          ...q,
          id: crypto.randomUUID(),
        })),
      });
      const out = output(test);
      delete out.questions;
      res.status(201).json({ success: true, data: out });
    }),
  );
  r.post(
    "/tests/:id/start",
    student,
    wrap(async (req, res) => {
      const test = await M.Test.findById(id(req.params.id)).select(
        "+questions",
      );
      if (!test?.published) fail(404, "Test not found.");
      await courseAccess(req.user, test.courseId);
      const query = { studentId: req.user._id, testId: test._id };
      let a = await M.Attempt.findOne(query).select("+questions");
      if (!a) {
        try {
          a = await M.Attempt.create({
            ...query,
            courseId: test.courseId,
            sections: test.sections,
            startedAt: new Date(),
            deadline: new Date(Date.now() + test.durationMinutes * 60000),
            questions: test.questions,
          });
        } catch (e) {
          if (e.code !== 11000) throw e;
          a = await M.Attempt.findOne(query).select("+questions");
        }
      }
      if (a.submittedAt) fail(409, "This test has already been submitted.");
      res.json({
        success: true,
        data: {
          id: String(a._id),
          testId: String(test._id),
          title: test.title,
          deadline: a.deadline,
          serverTime: new Date(),
          answers: a.savedAnswers || {},
          section: activeSection(a),
          questions: a.questions
            .filter(
              (q) => !a.sections?.length || activeSection(a).ids.includes(q.id),
            )
            .map((q) => ({
              id: q.id,
              prompt: q.prompt,
              options: q.options,
              marks: q.marks,
              negativeMarks: q.negativeMarks,
            })),
        },
      });
    }),
  );
  r.put(
    "/tests/:id/answers",
    student,
    wrap(async (req, res) => {
      const { answers } = parse(
        z.object({ answers: answerSchema }).strict(),
        req.body,
      );
      const a = await M.Attempt.findOne({
        studentId: req.user._id,
        testId: id(req.params.id),
        submittedAt: null,
      }).select("+questions");
      if (!a) fail(404, "No active attempt.");
      await courseAccess(req.user, a.courseId);
      if (Date.now() > a.deadline.getTime())
        fail(409, "The test deadline has passed.");
      const merged = mergeAnswers(a, answers);
      const section = activeSection(a);
      await M.Attempt.updateOne(
        { _id: a._id, submittedAt: null, deadline: { $gt: new Date() } },
        {
          $set: section
            ? Object.fromEntries(
                Object.entries(merged)
                  .filter(([key]) => section.ids.includes(key))
                  .map(([key, value]) => [`savedAnswers.${key}`, value]),
              )
            : { savedAnswers: merged },
        },
      );
      res.json({ success: true });
    }),
  );
  r.post(
    "/tests/:id/submit",
    student,
    wrap(async (req, res) => {
      const { answers } = parse(
        z.object({ answers: answerSchema }).strict(),
        req.body,
      );
      const a = await M.Attempt.findOne({
        studentId: req.user._id,
        testId: id(req.params.id),
      }).select("+questions");
      if (!a) fail(404, "Start the test first.");
      await courseAccess(req.user, a.courseId);
      if (a.submittedAt) return res.json({ success: true, data: a.result });
      const expired = Date.now() > a.deadline.getTime() + 5000;
      const result = grade(
        a.questions,
        expired ? a.savedAnswers || {} : mergeAnswers(a, answers),
      );
      result.expired = expired;
      const saved = await M.Attempt.findOneAndUpdate(
        { _id: a._id, submittedAt: null },
        { $set: { submittedAt: new Date(), result } },
        { new: true },
      );
      if (!saved) {
        const current = await M.Attempt.findById(a._id);
        return res.json({ success: true, data: current.result });
      }
      res.json({ success: true, data: result });
    }),
  );
  r.get(
    "/tests/:id/results",
    student,
    wrap(async (req, res) => {
      const a = await M.Attempt.findOne({
        testId: id(req.params.id),
        studentId: req.user._id,
        submittedAt: { $ne: null },
      });
      if (!a) fail(404, "No submitted result.");
      await courseAccess(req.user, a.courseId);
      res.json({ success: true, data: a.result });
    }),
  );
  r.get(
    "/analytics/student/:id",
    wrap(async (req, res) => {
      await studentAccess(req.user, req.params.id);
      let courses = null;
      if (req.user.role === "teacher")
        courses = (
          await M.Course.find({ ownerId: req.user._id }).select("_id")
        ).map((c) => c._id);
      res.json({
        success: true,
        data: await analytics(req.params.id, courses),
      });
    }),
  );
  r.get(
    "/assignments",
    wrap(async (req, res) => {
      const courseId = id(String(req.query.courseId || ""));
      await courseAccess(req.user, courseId);
      const data = await M.Assignment.find({ courseId }).limit(100);
      res.json({ success: true, data: data.map(output) });
    }),
  );
  r.post(
    "/assignments",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            courseId: objectId,
            title: text(),
            description: text(10000),
            dueAt: z.string().datetime(),
          })
          .strict(),
        req.body,
      );
      await courseAccess(req.user, data.courseId, true);
      res.status(201).json({
        success: true,
        data: output(
          await M.Assignment.create({ ...data, ownerId: req.user._id }),
        ),
      });
    }),
  );
  r.post(
    "/assignments/:id/submit",
    student,
    wrap(async (req, res) => {
      const { content } = parse(
        z.object({ content: text(20000) }).strict(),
        req.body,
      );
      const a = await M.Assignment.findById(id(req.params.id));
      if (!a) fail(404, "Assignment not found.");
      await courseAccess(req.user, a.courseId);
      if (a.dueAt && Date.now() > a.dueAt.getTime())
        fail(409, "The assignment deadline has passed.");
      if (
        await M.Submission.exists({
          assignmentId: a._id,
          studentId: req.user._id,
        })
      )
        fail(409, "Assignment already submitted.");
      res.status(201).json({
        success: true,
        data: output(
          await M.Submission.create({
            assignmentId: a._id,
            studentId: req.user._id,
            content,
          }),
        ),
      });
    }),
  );
  r.get(
    "/assignments/:id/submissions",
    teacher,
    wrap(async (req, res) => {
      const a = await M.Assignment.findById(id(req.params.id));
      if (!a) fail(404, "Assignment not found.");
      await courseAccess(req.user, a.courseId, true);
      res.json({
        success: true,
        data: (await M.Submission.find({ assignmentId: a._id }).limit(200)).map(
          output,
        ),
      });
    }),
  );
  r.patch(
    "/submissions/:id",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            grade: z.number().min(0).max(100),
            feedback: z.string().max(5000),
          })
          .strict(),
        req.body,
      );
      const s = await M.Submission.findById(id(req.params.id));
      if (!s) fail(404, "Submission not found.");
      const a = await M.Assignment.findById(s.assignmentId);
      await courseAccess(req.user, a.courseId, true);
      Object.assign(s, data);
      await s.save();
      res.json({ success: true, data: output(s) });
    }),
  );
  r.get(
    "/courses/:id/students",
    teacher,
    wrap(async (req, res) => {
      await courseAccess(req.user, req.params.id, true);
      const es = await M.Enrollment.find({ courseId: req.params.id }).limit(
        200,
      );
      res.json({
        success: true,
        data: (
          await M.User.find({ _id: { $in: es.map((e) => e.studentId) } })
        ).map(publicUser),
      });
    }),
  );
  r.get(
    "/attendance",
    wrap(async (req, res) => {
      const courseId = id(String(req.query.courseId || ""));
      await courseAccess(req.user, courseId);
      res.json({
        success: true,
        data: (
          await M.Attendance.find({
            courseId,
            ...(req.user.role === "student" ? { studentId: req.user._id } : {}),
          })
            .sort({ date: -1 })
            .limit(200)
        ).map(output),
      });
    }),
  );
  r.post(
    "/attendance",
    teacher,
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            courseId: objectId,
            studentId: objectId,
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            status: z.enum(["Present", "Absent", "Late"]),
          })
          .strict(),
        req.body,
      );
      await courseAccess(req.user, data.courseId, true);
      if (
        !(await M.Enrollment.exists({
          courseId: data.courseId,
          studentId: data.studentId,
        }))
      )
        fail(403, "Student is not enrolled.");
      const record = await M.Attendance.findOneAndUpdate(
        { courseId: data.courseId, studentId: data.studentId, date: data.date },
        { $set: { status: data.status, markedBy: req.user._id } },
        { new: true, upsert: true, runValidators: true },
      );
      res.json({ success: true, data: output(record) });
    }),
  );
  r.post(
    "/parent-links/invite",
    student,
    wrap(async (req, res) => {
      const raw = token();
      await M.ActionToken.create({
        userId: req.user._id,
        hash: hash(raw),
        purpose: "parent",
        expiresAt: new Date(Date.now() + 15 * 60000),
      });
      res.json({ success: true, data: { code: raw, expiresInMinutes: 15 } });
    }),
  );
  r.post(
    "/parent-links/accept",
    auth.roles("parent"),
    wrap(async (req, res) => {
      const { code } = parse(z.object({ code: text(128) }).strict(), req.body);
      const t = await M.ActionToken.findOneAndUpdate(
        {
          hash: hash(code),
          purpose: "parent",
          usedAt: null,
          expiresAt: { $gt: new Date() },
        },
        { $set: { usedAt: new Date() } },
      );
      if (!t) fail(400, "Invitation is invalid or expired.");
      await M.ParentLink.updateOne(
        { parentId: req.user._id, studentId: t.userId },
        { $setOnInsert: { parentId: req.user._id, studentId: t.userId } },
        { upsert: true },
      );
      res.json({ success: true });
    }),
  );
  r.get(
    "/parent-links/:id/teachers",
    auth.roles("parent"),
    wrap(async (req, res) => {
      const studentId = id(req.params.id);
      if (!(await M.ParentLink.exists({ parentId: req.user._id, studentId })))
        fail(403, "Student access denied.");
      const es = await M.Enrollment.find({ studentId }).select("courseId");
      const courses = await M.Course.find({
        _id: { $in: es.map((e) => e.courseId) },
      }).select("ownerId");
      const teachers = await M.User.find({
        _id: { $in: courses.map((c) => c.ownerId) },
        isActive: true,
      }).select("name firstName");
      res.json({
        success: true,
        data: teachers.map((t) => ({
          id: String(t._id),
          name: t.name || t.firstName,
        })),
      });
    }),
  );
  r.post(
    "/parent-links/:id/conversations",
    auth.roles("parent"),
    wrap(async (req, res) => {
      const studentId = id(req.params.id),
        { teacherId } = parse(
          z.object({ teacherId: objectId }).strict(),
          req.body,
        );
      if (!(await M.ParentLink.exists({ parentId: req.user._id, studentId })))
        fail(403, "Student access denied.");
      const es = await M.Enrollment.find({ studentId }).select("courseId");
      if (
        !(await M.Course.exists({
          _id: { $in: es.map((e) => e.courseId) },
          ownerId: teacherId,
        }))
      )
        fail(403, "Teacher access denied.");
      const room = await M.Room.findOneAndUpdate(
        {
          kind: "parent-teacher",
          parentId: req.user._id,
          ownerId: teacherId,
          studentId,
        },
        {
          $setOnInsert: {
            name: "Parent–teacher conversation",
            members: [req.user._id, teacherId],
            closed: false,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
      res.json({ success: true, data: output(room) });
    }),
  );
  r.get(
    "/parent-links",
    auth.roles("parent", "student"),
    wrap(async (req, res) => {
      const links = await M.ParentLink.find(
        req.user.role === "parent"
          ? { parentId: req.user._id }
          : { studentId: req.user._id },
      ).limit(20);
      const users = await M.User.find({
        _id: {
          $in: links.map((l) =>
            req.user.role === "parent" ? l.studentId : l.parentId,
          ),
        },
      });
      res.json({
        success: true,
        data: users.map((u) => ({
          id: String(u._id),
          name: u.name || u.firstName,
          role: u.role,
        })),
      });
    }),
  );
  r.delete(
    "/parent-links/:id",
    auth.roles("parent", "student"),
    wrap(async (req, res) => {
      const other = id(req.params.id);
      await M.ParentLink.deleteMany(
        req.user.role === "parent"
          ? { parentId: req.user._id, studentId: other }
          : { studentId: req.user._id, parentId: other },
      );
      res.json({ success: true });
    }),
  );
  r.get(
    "/notifications",
    wrap(async (req, res) =>
      res.json({
        success: true,
        data: (
          await M.Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100)
        ).map(output),
      }),
    ),
  );
  r.put(
    "/notifications/read-all",
    wrap(async (req, res) => {
      await M.Notification.updateMany(
        { userId: req.user._id },
        { $set: { read: true } },
      );
      res.json({ success: true });
    }),
  );
  r.put(
    "/notifications/:id/read",
    wrap(async (req, res) => {
      await M.Notification.updateOne(
        { _id: id(req.params.id), userId: req.user._id },
        { $set: { read: true } },
      );
      res.json({ success: true });
    }),
  );
  r.get(
    "/rooms/active",
    wrap(async (req, res) => {
      const enrollments = await M.Enrollment.find({
        studentId: req.user._id,
      }).select("courseId");
      const owned = await M.Course.find({ ownerId: req.user._id }).select(
        "_id",
      );
      const courses = [
        ...enrollments.map((e) => e.courseId),
        ...owned.map((c) => c._id),
      ];
      const data = await M.Room.find({
        ...(req.user.role === "parent"
          ? { kind: "parent-teacher", members: req.user._id }
          : {
              $and: [
                {
                  $or: [
                    { kind: { $ne: "parent-teacher" } },
                    { members: req.user._id },
                  ],
                },
              ],
            }),
        closed: false,
        $or: [
          { courseId: { $exists: false } },
          { courseId: null },
          { courseId: { $in: courses } },
          { ownerId: req.user._id },
        ],
      }).limit(100);
      res.json({
        success: true,
        data: data.map((room) => {
          const o = output(room);
          delete o.members;
          return {
            ...o,
            users: room.members.length,
            joined: room.members.some((m) => same(m, req.user._id)),
          };
        }),
      });
    }),
  );
  r.post(
    "/rooms",
    auth.roles("student", "teacher", "admin"),
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            name: text(100),
            description: z.string().max(1000).default(""),
            courseId: objectId.optional(),
          })
          .strict(),
        req.body,
      );
      if (data.courseId) await courseAccess(req.user, data.courseId, true);
      if (
        (await M.Room.countDocuments({
          ownerId: req.user._id,
          closed: false,
        })) >= 10
      )
        fail(409, "Close an existing room before creating another.");
      res.status(201).json({
        success: true,
        data: output(
          await M.Room.create({
            ...data,
            ownerId: req.user._id,
            members: [req.user._id],
          }),
        ),
      });
    }),
  );
  r.post(
    "/rooms/:id/join",
    auth.roles("student", "teacher", "parent", "admin"),
    wrap(async (req, res) => {
      const room = await M.Room.findById(id(req.params.id));
      if (!room || room.closed) fail(404, "Room not found.");
      if (
        room.kind === "parent-teacher" &&
        !room.members.some((m) => same(m, req.user._id))
      )
        fail(403, "Private conversation access denied.");
      if (req.user.role === "parent" && room.kind !== "parent-teacher")
        fail(403, "Join your parent–teacher conversation.");
      if (room.courseId) await courseAccess(req.user, room.courseId);
      const joined = await M.Room.findOneAndUpdate(
        {
          _id: room._id,
          closed: false,
          $or: [
            { members: req.user._id },
            { $expr: { $lt: [{ $size: "$members" }, 50] } },
          ],
        },
        { $addToSet: { members: req.user._id } },
        { new: true },
      );
      if (!joined) fail(409, "Room is full.");
      res.json({ success: true });
    }),
  );
  r.post(
    "/rooms/:id/leave",
    wrap(async (req, res) => {
      await M.Room.updateOne(
        { _id: id(req.params.id) },
        { $pull: { members: req.user._id } },
      );
      res.json({ success: true });
    }),
  );
  r.delete(
    "/rooms/:id",
    wrap(async (req, res) => {
      const room = await M.Room.findById(id(req.params.id));
      if (
        !room ||
        (!same(room.ownerId, req.user._id) && req.user.role !== "admin")
      )
        fail(403, "Room access denied.");
      room.closed = true;
      await room.save();
      res.json({ success: true });
    }),
  );
  r.get(
    "/rooms/:id/ice",
    wrap(async (req, res) => {
      await roomAccess(req.user, req.params.id);
      if (!process.env.TURN_URL || !process.env.TURN_SHARED_SECRET)
        return res.json({
          success: true,
          data: { configured: false, iceServers: [] },
        });
      if (!/^turns?:[^\s]+$/.test(process.env.TURN_URL))
        fail(503, "Call infrastructure configuration is invalid.");
      const username = `${Math.floor(Date.now() / 1000) + 3600}:${req.user._id}`;
      const credential = crypto
        .createHmac("sha1", process.env.TURN_SHARED_SECRET)
        .update(username)
        .digest("base64");
      res.json({
        success: true,
        data: {
          configured: true,
          iceServers: [{ urls: process.env.TURN_URL, username, credential }],
        },
      });
    }),
  );
  r.get(
    "/rooms/:id/messages",
    wrap(async (req, res) => {
      await roomAccess(req.user, req.params.id);
      res.json({
        success: true,
        data: (
          await M.Message.find({ roomId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(100)
        )
          .reverse()
          .map(output),
      });
    }),
  );
  r.post(
    "/rooms/:id/messages",
    wrap(async (req, res) => {
      await roomAccess(req.user, req.params.id);
      const { content } = parse(
        z.object({ content: text(4000) }).strict(),
        req.body,
      );
      const m = await M.Message.create({
        roomId: req.params.id,
        userId: req.user._id,
        name: req.user.name || req.user.firstName,
        content,
      });
      res.status(201).json({ success: true, data: output(m) });
    }),
  );
  r.get(
    "/plans",
    student,
    wrap(async (req, res) =>
      res.json({
        success: true,
        data: output(await M.Plan.findOne({ studentId: req.user._id })),
      }),
    ),
  );
  r.post(
    "/plans",
    student,
    wrap(async (req, res) => {
      const a = await analytics(req.user._id);
      const topics = a.weakTopics.length
        ? a.weakTopics
        : ["Review your current chapter", "Complete a diagnostic test"];
      const items = topics.map((topic) => ({
        topic,
        minutes: 30,
        completed: false,
      }));
      res.json({
        success: true,
        data: output(
          await M.Plan.findOneAndUpdate(
            { studentId: req.user._id },
            { $set: { items } },
            { new: true, upsert: true },
          ),
        ),
      });
    }),
  );
  r.patch(
    "/plans/:itemId",
    student,
    wrap(async (req, res) => {
      const { completed } = parse(
        z.object({ completed: z.boolean() }).strict(),
        req.body,
      );
      const plan = await M.Plan.findOneAndUpdate(
        { studentId: req.user._id, "items._id": id(req.params.itemId) },
        { $set: { "items.$.completed": completed } },
        { new: true },
      );
      if (!plan) fail(404, "Plan item not found.");
      res.json({ success: true, data: output(plan) });
    }),
  );
  r.post(
    "/admin/announcements",
    auth.roles("admin"),
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            title: text(200),
            message: text(3000),
            audience: z.enum(["student", "teacher", "parent", "all"]),
          })
          .strict(),
        req.body,
      );
      const users = await M.User.find({
        isActive: true,
        isDeleted: { $ne: true },
        ...(data.audience === "all" ? {} : { role: data.audience }),
      })
        .select("_id")
        .limit(1000);
      if (users.length)
        await M.Notification.insertMany(
          users.map((user) => ({
            userId: user._id,
            title: data.title,
            message: data.message,
            category: "Announcements",
          })),
        );
      res
        .status(201)
        .json({ success: true, data: { recipients: users.length } });
    }),
  );
  r.get(
    "/admin/users",
    auth.roles("admin"),
    wrap(async (req, res) =>
      res.json({
        success: true,
        data: (
          await M.User.find({ isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(100)
        ).map(publicUser),
      }),
    ),
  );
  r.patch(
    "/admin/users/:id",
    auth.roles("admin"),
    wrap(async (req, res) => {
      const data = parse(
        z
          .object({
            role: z.enum(["student", "teacher", "parent"]).optional(),
            isActive: z.boolean().optional(),
            track: text(150).optional(),
          })
          .strict(),
        req.body,
      );
      const u = await M.User.findById(id(req.params.id));
      if (!u || u.role === "admin")
        fail(403, "This account cannot be changed here.");
      await M.User.updateOne(
        { _id: u._id },
        { $set: data, $inc: { tokenVersion: 1 } },
      );
      await M.Session.updateMany(
        { userId: u._id },
        { $set: { revokedAt: new Date() } },
      );
      await M.Audit.create({
        actorId: req.user._id,
        action: "account.updated",
        targetId: String(u._id),
      });
      res.json({ success: true });
    }),
  );
  r.get(
    "/admin/audit",
    auth.roles("admin"),
    wrap(async (req, res) =>
      res.json({
        success: true,
        data: (await M.Audit.find().sort({ createdAt: -1 }).limit(100)).map(
          output,
        ),
      }),
    ),
  );
  r.get(
    "/admin/stats",
    auth.roles("admin"),
    wrap(async (req, res) => {
      const [students, teachers, parents, courses] = await Promise.all(
        ["student", "teacher", "parent"]
          .map((role) => M.User.countDocuments({ role, isActive: true }))
          .concat(M.Course.countDocuments()),
      );
      res.json({
        success: true,
        data: { students, teachers, parents, courses },
      });
    }),
  );
  return r;
}
module.exports = {
  createLearning,
  courseAccess,
  studentAccess,
  roomAccess,
  analytics,
  output,
  answerSchema,
  question,
};
