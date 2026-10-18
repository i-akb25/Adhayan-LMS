const mongoose = require("mongoose");
const { Schema } = mongoose;
const id = { type: Schema.Types.ObjectId, required: true };
const optionalId = { type: Schema.Types.ObjectId };
function model(name, definition, indexes = [], collection) {
  const schema = new Schema(definition, { timestamps: true, strict: "throw" });
  for (const [fields, options] of indexes) schema.index(fields, options);
  return mongoose.model(name, schema, collection);
}
// Preserve the existing users collection and its identity fields. New learning records use explicit collections.
const User = model(
  "User",
  {
    name: String,
    firstName: String,
    middleName: String,
    lastName: String,
    username: { type: String, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "teacher", "parent", "admin"],
      default: "student",
    },
    status: { type: String, default: "active" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    avatar: String,
    phone: String,
    track: String,
    theme: String,
    bio: String,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    tokenVersion: { type: Number, default: 0 },
    consentedAt: Date,
    deletionRequestedAt: Date,
    fileBytes: { type: Number, default: 0 },
  },
  [
    [{ email: 1 }, { unique: true }],
    [{ username: 1 }, { unique: true, sparse: true }],
  ],
  "users",
);
const Session = model(
  "LoginSession",
  {
    userId: id,
    accessHash: { type: String, required: true, select: false },
    refreshHash: { type: String, required: true, select: false },
    csrfHash: { type: String, required: true, select: false },
    accessExpiresAt: Date,
    expiresAt: Date,
    revokedAt: Date,
    version: { type: Number, default: 0 },
  },
  [
    [{ accessHash: 1 }, { unique: true }],
    [{ refreshHash: 1 }, { unique: true }],
    [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
    [{ userId: 1, revokedAt: 1 }, {}],
  ],
  "adhayan_sessions",
);
const ActionToken = model(
  "ActionToken",
  {
    userId: id,
    hash: { type: String, required: true, select: false },
    purpose: {
      type: String,
      enum: ["reset", "verify", "parent", "mfa"],
      required: true,
    },
    expiresAt: Date,
    usedAt: Date,
  },
  [
    [{ hash: 1 }, { unique: true }],
    [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ],
  "adhayan_action_tokens",
);
const Course = model(
  "LearningCourse",
  {
    ownerId: id,
    title: String,
    description: String,
    track: String,
    published: { type: Boolean, default: false },
    institutionId: optionalId,
    reviewRequired: { type: Boolean, default: false },
    reviewedAt: Date,
    reviewedBy: optionalId,
    exam: String,
    stage: String,
    syllabusYear: Number,
    syllabus: String,
    sources: [String],
  },
  [[{ track: 1, published: 1 }, {}]],
  "adhayan_courses",
);
const Enrollment = model(
  "LearningEnrollment",
  { studentId: id, courseId: id },
  [
    [{ studentId: 1, courseId: 1 }, { unique: true }],
    [{ courseId: 1 }, {}],
  ],
  "adhayan_enrollments",
);
const Lesson = model(
  "LearningLesson",
  {
    courseId: id,
    title: String,
    chapter: String,
    subject: String,
    content: String,
    videoUrl: String,
    order: Number,
    workedExample: String,
    revisionNotes: String,
    sourceUrl: String,
  },
  [[{ courseId: 1, order: 1 }, {}]],
  "adhayan_lessons",
);
const Progress = model(
  "LearningProgress",
  {
    studentId: id,
    lessonId: id,
    courseId: id,
    completed: { type: Boolean, default: false },
    notes: String,
  },
  [[{ studentId: 1, lessonId: 1 }, { unique: true }]],
  "adhayan_progress",
);
const Material = model(
  "LearningMaterial",
  { courseId: id, title: String, type: String, url: String, ownerId: id },
  [[{ courseId: 1 }, {}]],
  "adhayan_materials",
);
const questionSchema = new Schema(
  {
    id: String,
    prompt: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
    topic: String,
    marks: Number,
    negativeMarks: Number,
  },
  { _id: false },
);
const Test = model(
  "LearningTest",
  {
    courseId: id,
    ownerId: id,
    title: String,
    durationMinutes: Number,
    sections: [
      {
        _id: false,
        name: String,
        durationMinutes: Number,
        questionCount: Number,
      },
    ],
    questions: { type: [questionSchema], select: false },
    published: { type: Boolean, default: false },
  },
  [[{ courseId: 1, published: 1 }, {}]],
  "adhayan_tests",
);
const Attempt = model(
  "LearningAttempt",
  {
    studentId: id,
    testId: id,
    courseId: id,
    sections: [
      {
        _id: false,
        name: String,
        durationMinutes: Number,
        questionCount: Number,
      },
    ],
    startedAt: Date,
    deadline: Date,
    submittedAt: Date,
    questions: { type: [questionSchema], select: false },
    savedAnswers: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
  },
  [[{ studentId: 1, testId: 1 }, { unique: true }]],
  "adhayan_attempts",
);
const Assignment = model(
  "LearningAssignment",
  {
    courseId: id,
    ownerId: id,
    title: String,
    description: String,
    dueAt: Date,
  },
  [[{ courseId: 1 }, {}]],
  "adhayan_assignments",
);
const Submission = model(
  "LearningSubmission",
  {
    assignmentId: id,
    studentId: id,
    content: String,
    grade: { type: Number, min: 0, max: 100 },
    feedback: String,
    fileIds: [Schema.Types.ObjectId],
  },
  [[{ assignmentId: 1, studentId: 1 }, { unique: true }]],
  "adhayan_submissions",
);
const Attendance = model(
  "LearningAttendance",
  {
    courseId: id,
    studentId: id,
    date: String,
    status: { type: String, enum: ["Present", "Absent", "Late"] },
    markedBy: id,
  },
  [[{ courseId: 1, studentId: 1, date: 1 }, { unique: true }]],
  "adhayan_attendance",
);
const ParentLink = model(
  "VerifiedParentLink",
  { parentId: id, studentId: id },
  [[{ parentId: 1, studentId: 1 }, { unique: true }]],
  "adhayan_parent_links",
);
const Notification = model(
  "LearningNotification",
  {
    userId: id,
    title: String,
    message: String,
    category: String,
    read: { type: Boolean, default: false },
  },
  [[{ userId: 1, createdAt: -1 }, {}]],
  "adhayan_notifications",
);
const Room = model(
  "LearningRoom",
  {
    ownerId: id,
    kind: String,
    parentId: optionalId,
    studentId: optionalId,
    courseId: optionalId,
    name: String,
    description: String,
    members: [Schema.Types.ObjectId],
    blockedMembers: [Schema.Types.ObjectId],
    scheduledClassId: optionalId,
    closed: { type: Boolean, default: false },
  },
  [
    [{ members: 1, closed: 1 }, {}],
    [
      { kind: 1, parentId: 1, ownerId: 1, studentId: 1 },
      { unique: true, partialFilterExpression: { kind: "parent-teacher" } },
    ],
  ],
  "adhayan_rooms",
);
const Message = model(
  "LearningMessage",
  { roomId: id, userId: id, name: String, content: String },
  [[{ roomId: 1, createdAt: -1 }, {}]],
  "adhayan_messages",
);
const Audit = model(
  "SecurityAudit",
  { actorId: optionalId, action: String, targetId: String },
  [[{ createdAt: 1 }, { expireAfterSeconds: 2592000 }]],
  "adhayan_audit",
);
const Plan = model(
  "LearningPlan",
  {
    studentId: id,
    items: [{ topic: String, minutes: Number, completed: Boolean }],
  },
  [[{ studentId: 1 }, { unique: true }]],
  "adhayan_plans",
);
const Institution = model(
  "Institution",
  {
    name: String,
    description: String,
    active: { type: Boolean, default: true },
  },
  [],
  "adhayan_institutions",
);
const Membership = model(
  "InstitutionMember",
  { institutionId: id, userId: id },
  [[{ institutionId: 1, userId: 1 }, { unique: true }]],
  "adhayan_memberships",
);
const PrivateFile = model(
  "PrivateLearningFile",
  {
    courseId: id,
    ownerId: id,
    scope: { type: String, enum: ["course", "submission"], default: "course" },
    assignmentId: optionalId,
    name: String,
    title: String,
    mime: String,
    size: Number,
    ciphertext: { type: Buffer, select: false },
    nonce: { type: Buffer, select: false },
    tag: { type: Buffer, select: false },
  },
  [
    [{ courseId: 1 }, {}],
    [{ ownerId: 1 }, {}],
  ],
  "adhayan_private_files",
);
const ScheduledClass = model(
  "ScheduledClass",
  {
    courseId: id,
    ownerId: id,
    roomId: id,
    title: String,
    startsAt: Date,
    endsAt: Date,
    cancelled: { type: Boolean, default: false },
  },
  [[{ courseId: 1, startsAt: 1 }, {}]],
  "adhayan_classes",
);
const RoomReport = model(
  "RoomReport",
  {
    roomId: id,
    messageId: id,
    reporterId: id,
    reason: String,
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
    },
    resolvedBy: optionalId,
    resolvedAt: Date,
    action: String,
  },
  [
    [{ reporterId: 1, messageId: 1 }, { unique: true }],
    [{ status: 1, createdAt: -1 }, {}],
  ],
  "adhayan_room_reports",
);
module.exports = {
  ScheduledClass,
  RoomReport,
  Institution,
  Membership,
  PrivateFile,
  User,
  Session,
  ActionToken,
  Course,
  Enrollment,
  Lesson,
  Progress,
  Material,
  Test,
  Attempt,
  Assignment,
  Submission,
  Attendance,
  ParentLink,
  Notification,
  Room,
  Message,
  Audit,
  Plan,
};
