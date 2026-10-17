const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createApp } = require("../app");
const M = require("../models");
let db, app;
const origin = "http://localhost:5173";
const secret = "ValidPassword123!";
before(async () => {
  db = await MongoMemoryServer.create({
    instance: { args: ["--nounixsocket", "--wiredTigerCacheSizeGB", "0.25"] },
  });
  await mongoose.connect(db.getUri());
  await Promise.all(Object.values(M).map((model) => model.init()));
  app = createApp({
    NODE_ENV: "test",
    secure: false,
    TRUST_PROXY: 0,
    origins: [origin],
    JWT_ACCESS_SECRET: "a".repeat(32),
    JWT_REFRESH_SECRET: "b".repeat(32),
  });
});
after(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
});
function capture(res) {
  const cookies = res.headers["set-cookie"].map((v) => v.split(";")[0]);
  return {
    cookies,
    csrf: cookies.find((c) => c.startsWith("adhayan_csrf=")).split("=")[1],
    id: res.body.user.id,
  };
}
function call(user, method, path, body) {
  let r = request(app)[method](path).set("Origin", origin);
  if (user) r = r.set("Cookie", user.cookies).set("X-CSRF-Token", user.csrf);
  return body === undefined ? r : r.send(body);
}
async function register(role = "Student") {
  const email = `u${new mongoose.Types.ObjectId()}@example.test`;
  const res = await call(null, "post", "/api/auth/register", {
    name: "Test Learner",
    email,
    password: secret,
    role,
    consent: true,
    profileData: { class: "11", target: "JEE" },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { ...capture(res), email };
}
async function teacher() {
  const u = await register();
  await M.User.updateOne({ _id: u.id }, { $set: { role: "teacher" } });
  return u;
}
async function course(owner) {
  const r = await call(owner, "post", "/api/courses", {
    title: "Algebra",
    description: "A reviewed course",
    track: "11 · JEE",
    published: true,
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.data.id;
}
test("registration cannot assign elevated roles, bypass consent or inject fields", async () => {
  for (const extra of [
    { role: "Admin", consent: true },
    { role: "Teacher", consent: true },
    { role: "Student", consent: false },
    { role: "Student", consent: true, emailVerified: true },
  ]) {
    const r = await call(null, "post", "/api/auth/register", {
      name: "Test",
      email: "forbidden@example.test",
      password: secret,
      ...extra,
    });
    assert.equal(r.status, 400);
  }
  const r = await call(null, "post", "/api/auth/login", {
    email: { $ne: null },
    password: "x",
  });
  assert.equal(r.status, 400);
});
test("cookie sessions are opaque, secret hashes are not returned and CSRF is enforced", async () => {
  const u = await register();
  const me = await call(u, "get", "/api/auth/me");
  assert.equal(me.status, 200);
  for (const key of ["password", "tokenVersion", "accessHash", "refreshHash"])
    assert.equal(me.body.user[key], undefined);
  const session = await M.Session.findOne({ userId: u.id }).select(
    "+accessHash +refreshHash",
  );
  assert.ok(!u.cookies.join(";").includes(session.accessHash));
  const forbidden = await request(app)
    .put("/api/users/profile")
    .set("Origin", origin)
    .set("Cookie", u.cookies)
    .send({ name: "Forged" });
  assert.equal(forbidden.status, 403);
  const cross = await request(app)
    .put("/api/users/profile")
    .set("Origin", "https://evil.test")
    .set("Cookie", u.cookies)
    .set("X-CSRF-Token", u.csrf)
    .send({ name: "Forged" });
  assert.equal(cross.status, 403);
  assert.equal(
    (await call(u, "put", "/api/users/profile", { role: "admin" })).status,
    400,
  );
});
test("login works after registration, refresh rotates credentials, logout revokes session", async () => {
  const u = await register();
  const login = await call(null, "post", "/api/auth/login", {
    email: u.email,
    password: secret,
  });
  assert.equal(login.status, 200);
  let session = capture(login);
  assert.match(
    login.headers["set-cookie"].find((c) => c.startsWith("adhayan_session=")),
    /HttpOnly/,
  );
  assert.match(login.headers["set-cookie"][0], /SameSite=Strict/);
  const refreshed = await call(session, "post", "/api/auth/refresh", {});
  assert.equal(refreshed.status, 200);
  assert.equal(
    (await call(session, "post", "/api/auth/refresh", {})).status,
    401,
  );
  session = capture(refreshed);
  assert.equal((await call(session, "get", "/api/auth/me")).status, 200);
  assert.equal(
    (await call(session, "post", "/api/auth/logout", {})).status,
    200,
  );
  assert.equal((await call(session, "get", "/api/auth/me")).status, 401);
});
test("expired access sessions can refresh, revoked versions cannot", async () => {
  const u = await register();
  await M.Session.updateMany(
    { userId: u.id },
    { $set: { accessExpiresAt: new Date(0) } },
  );
  assert.equal((await call(u, "get", "/api/auth/me")).status, 401);
  const r = await call(u, "post", "/api/auth/refresh", {});
  assert.equal(r.status, 200);
  const current = capture(r);
  await M.User.updateOne({ _id: u.id }, { $inc: { tokenVersion: 1 } });
  assert.equal(
    (await call(current, "post", "/api/auth/refresh", {})).status,
    401,
  );
});
test("course enrolment, lesson notes, assessment grading and ownership boundaries", async () => {
  const t = await teacher(),
    outsider = await teacher(),
    s = await register(),
    other = await register();
  const c = await course(t);
  assert.equal(
    (await call(outsider, "patch", `/api/courses/${c}`, { published: false }))
      .status,
    403,
  );
  assert.equal((await call(s, "get", `/api/courses/${c}/lessons`)).status, 403);
  assert.equal(
    (await call(s, "post", `/api/courses/${c}/enroll`, {})).status,
    200,
  );
  const lesson = await call(t, "post", `/api/courses/${c}/lessons`, {
    title: "Linear equations",
    chapter: "Equations",
    subject: "Math",
    content: "Solve x + 2 = 5 by subtracting 2.",
  });
  assert.equal(lesson.status, 201);
  const l = lesson.body.data.id;
  assert.equal(
    (
      await call(s, "put", `/api/lessons/${l}/progress`, {
        completed: true,
        notes: "x = 3",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call(other, "put", `/api/lessons/${l}/progress`, {
        completed: true,
        notes: "forged",
      })
    ).status,
    403,
  );
  const test = await call(t, "post", "/api/tests", {
    courseId: c,
    title: "Linear quiz",
    durationMinutes: 10,
    published: true,
    questions: [
      {
        prompt: "x+2=5. Find x.",
        options: ["3", "7"],
        correctIndex: 0,
        explanation: "Subtract two from both sides.",
        topic: "Equations",
        marks: 4,
        negativeMarks: 1,
      },
    ],
  });
  assert.equal(test.status, 201, JSON.stringify(test.body));
  assert.equal(test.body.data.questions, undefined);
  const testId = test.body.data.id;
  const started = await call(s, "post", `/api/tests/${testId}/start`, {});
  assert.equal(started.status, 200);
  const q = started.body.data.questions[0];
  assert.equal(q.correctIndex, undefined);
  assert.equal(q.explanation, undefined);
  assert.equal(
    (
      await call(s, "post", `/api/tests/${testId}/submit`, {
        answers: { [q.id]: 0 },
        score: 999,
      })
    ).status,
    400,
  );
  const result = await call(s, "post", `/api/tests/${testId}/submit`, {
    answers: { [q.id]: 0 },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.score, 4);
  assert.equal(
    (
      await call(s, "post", `/api/tests/${testId}/submit`, {
        answers: { [q.id]: 1 },
      })
    ).body.data.score,
    4,
  );
  assert.equal(
    (await call(other, "get", `/api/tests/${testId}/results`)).status,
    404,
  );
  const a = await call(s, "get", `/api/analytics/student/${s.id}`);
  assert.equal(a.body.data.completedLessons, 1);
  assert.equal(a.body.data.testsCompleted, 1);
});
test("parents need a single-use invitation and students can revoke access", async () => {
  const s = await register(),
    p = await register("Parent"),
    other = await register("Parent");
  assert.equal(
    (await call(p, "get", `/api/analytics/student/${s.id}`)).status,
    403,
  );
  const invite = await call(s, "post", "/api/parent-links/invite", {});
  assert.equal(invite.status, 200);
  assert.equal(
    (
      await call(p, "post", "/api/parent-links/accept", {
        code: invite.body.data.code,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call(other, "post", "/api/parent-links/accept", {
        code: invite.body.data.code,
      })
    ).status,
    400,
  );
  assert.equal(
    (await call(p, "get", `/api/analytics/student/${s.id}`)).status,
    200,
  );
  assert.equal(
    (await call(s, "delete", `/api/parent-links/${p.id}`)).status,
    200,
  );
  assert.equal(
    (await call(p, "get", `/api/analytics/student/${s.id}`)).status,
    403,
  );
});
test("assignment, attendance and private room access enforce enrolment and ownership", async () => {
  const t = await teacher(),
    s = await register(),
    other = await register();
  const c = await course(t);
  await call(s, "post", `/api/courses/${c}/enroll`, {});
  const assignment = await call(t, "post", "/api/assignments", {
    courseId: c,
    title: "Practice",
    description: "Explain your solution.",
    dueAt: new Date(Date.now() + 86400000).toISOString(),
  });
  assert.equal(assignment.status, 201);
  const aid = assignment.body.data.id;
  assert.equal(
    (
      await call(other, "post", `/api/assignments/${aid}/submit`, {
        content: "forged",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call(s, "post", `/api/assignments/${aid}/submit`, {
        content: "My solution",
      })
    ).status,
    201,
  );
  assert.equal(
    (await call(s, "get", `/api/assignments/${aid}/submissions`)).status,
    403,
  );
  assert.equal(
    (
      await call(t, "post", "/api/attendance", {
        courseId: c,
        studentId: other.id,
        date: "2026-10-17",
        status: "Present",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call(t, "post", "/api/attendance", {
        courseId: c,
        studentId: s.id,
        date: "2026-10-17",
        status: "Present",
      })
    ).status,
    200,
  );
  const room = await call(t, "post", "/api/rooms", {
    name: "Class discussion",
    courseId: c,
  });
  assert.equal(room.status, 201);
  const rid = room.body.data.id;
  assert.equal(
    (await call(other, "post", `/api/rooms/${rid}/join`, {})).status,
    403,
  );
  await call(s, "post", `/api/rooms/${rid}/join`, {});
  assert.equal(
    (await call(s, "post", `/api/rooms/${rid}/messages`, { content: "Hello" }))
      .status,
    201,
  );
  assert.equal(
    (await call(other, "get", `/api/rooms/${rid}/messages`)).status,
    403,
  );
});
test("AI and email configuration fail clearly without leaking provider details", async () => {
  const s = await register();
  const ai = await call(s, "post", "/api/ai/chat", {
    message: "Explain algebra",
  });
  assert.equal(ai.status, 503);
  assert.ok(!JSON.stringify(ai.body).includes("stack"));
  const r = await call(null, "post", "/api/auth/forgot-password", {
    email: s.email,
  });
  assert.equal(r.status, 503);
});
test("private files are never served, errors omit internals and bodies are bounded", async () => {
  for (const p of [
    "/.env",
    "/.git/config",
    "/uploads/private.pdf",
    "/api/admin/users",
  ])
    assert.ok([401, 404].includes((await request(app).get(p)).status));
  const invalid = await call(null, "post", "/api/auth/register", {
    name: "x".repeat(300000),
  });
  assert.equal(invalid.status, 413);
  assert.equal(invalid.body.stack, undefined);
  assert.equal(
    (await request(app).get("/health/live")).headers["x-content-type-options"],
    "nosniff",
  );
});

test("encrypted backups restore BSON records into an empty isolated database and reject tampering", async () => {
  const fs = require("node:fs/promises");
  const os = require("node:os");
  const path = require("node:path");
  const { backup, restore } = require("../lib/backup");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "adhayan-backup-"));
  const file = path.join(dir, "data.enc");
  const bad = path.join(dir, "bad.enc");
  const key = require("node:crypto").randomBytes(32).toString("hex");
  try {
    const counts = await backup(mongoose.connection.db, file, key);
    const bytes = await fs.readFile(file);
    assert.ok(!bytes.includes(Buffer.from("example.test")));
    const target = mongoose.connection.client.db("adhayan_restore_test");
    const restored = await restore(target, file, key);
    assert.deepEqual(restored, counts);
    assert.equal(
      await target.collection("adhayan_sessions").countDocuments(),
      0,
    );
    const original = await M.User.findOne();
    const copy = await target
      .collection("users")
      .findOne({ _id: original._id });
    assert.ok(copy._id.equals(original._id));
    assert.equal(copy.tokenVersion, original.tokenVersion + 1);
    await assert.rejects(() => restore(target, file, key), /empty/);
    bytes[bytes.length - 1] ^= 1;
    await fs.writeFile(bad, bytes);
    const other = mongoose.connection.client.db("adhayan_restore_tampered");
    await assert.rejects(() => restore(other, bad, key));
    assert.equal((await other.listCollections().toArray()).length, 0);
    await target.dropDatabase();
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("production requires HTTPS and emits Secure cookies behind a trusted proxy", async () => {
  const production = createApp({
    NODE_ENV: "test",
    secure: true,
    TRUST_PROXY: 1,
    origins: ["https://lms.example.test"],
    JWT_ACCESS_SECRET: "a".repeat(32),
    JWT_REFRESH_SECRET: "b".repeat(32),
  });
  assert.equal((await request(production).get("/api/auth/me")).status, 426);
  const email = `secure${new mongoose.Types.ObjectId()}@example.test`;
  const r = await request(production)
    .post("/api/auth/register")
    .set("Origin", "https://lms.example.test")
    .set("X-Forwarded-Proto", "https")
    .send({
      name: "Secure Learner",
      email,
      password: secret,
      role: "Student",
      consent: true,
    });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.ok(r.headers["set-cookie"].every((c) => c.includes("Secure")));
  assert.match(r.headers["content-security-policy"], /script-src 'self'/);
});

test("expired tests grade saved answers and reject late answer changes", async () => {
  const t = await teacher(),
    student = await register();
  const courseId = await course(t);
  await call(student, "post", `/api/courses/${courseId}/enroll`, {});
  const q = await call(t, "post", "/api/tests", {
    courseId,
    title: "Autosave test",
    durationMinutes: 1,
    published: true,
    questions: [
      {
        prompt: "One plus one?",
        options: ["2", "3"],
        correctIndex: 0,
        explanation: "Two units.",
        topic: "Arithmetic",
      },
    ],
  });
  const tid = q.body.data.id;
  const start = await call(student, "post", `/api/tests/${tid}/start`, {});
  const qid = start.body.data.questions[0].id;
  assert.equal(
    (
      await call(student, "put", `/api/tests/${tid}/answers`, {
        answers: { [qid]: 0 },
      })
    ).status,
    200,
  );
  await M.Attempt.updateOne(
    { studentId: student.id, testId: tid },
    { $set: { deadline: new Date(0) } },
  );
  assert.equal(
    (
      await call(student, "put", `/api/tests/${tid}/answers`, {
        answers: { [qid]: 1 },
      })
    ).status,
    409,
  );
  const result = await call(student, "post", `/api/tests/${tid}/submit`, {
    answers: { [qid]: 1 },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.score, 1);
  assert.equal(result.body.data.expired, true);
});

test("realtime rooms reject nonmembers and stop delivering messages to revoked sessions", async () => {
  const http = require("node:http");
  const { realtime } = require("../modules/realtime");
  const clientRequire = require("node:module").createRequire(
    require("node:path").join(__dirname, "../../client/package.json"),
  );
  const { io: connect } = clientRequire("socket.io-client");
  const owner = await teacher(),
    student = await register(),
    outsider = await register();
  const courseId = await course(owner);
  await call(student, "post", `/api/courses/${courseId}/enroll`, {});
  const created = await call(owner, "post", "/api/rooms", {
    name: "Private live room",
    courseId,
  });
  const roomId = created.body.data.id;
  await call(student, "post", `/api/rooms/${roomId}/join`, {});
  const server = http.createServer(app);
  const realtimeServer = realtime(server, app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const sockets = [];
  const open = (user) =>
    new Promise((resolve, reject) => {
      const s = connect(url, {
        transports: ["websocket"],
        extraHeaders: { Origin: origin, Cookie: user.cookies.join("; ") },
        auth: { csrf: user.csrf },
        reconnection: false,
        timeout: 3000,
      });
      sockets.push(s);
      s.once("connect", () => resolve(s));
      s.once("connect_error", reject);
    });
  const emit = (s, event, data) =>
    new Promise((resolve, reject) => {
      s.timeout(3000).emit(event, data, (err, result) =>
        err ? reject(err) : resolve(result),
      );
    });
  try {
    const a = await open(owner),
      b = await open(student),
      c = await open(outsider);
    assert.equal((await emit(a, "room:join", { roomId })).success, true);
    assert.equal((await emit(b, "room:join", { roomId })).success, true);
    assert.equal((await emit(c, "room:join", { roomId })).success, false);
    const received = new Promise((resolve) => b.once("chat:message", resolve));
    assert.equal(
      (
        await emit(a, "chat:message:send", {
          roomId,
          content: "Reviewed discussion",
        })
      ).success,
      true,
    );
    assert.equal((await received).content, "Reviewed discussion");
    const disconnected = new Promise((resolve) =>
      b.once("disconnect", resolve),
    );
    await call(student, "post", "/api/auth/logout", {});
    assert.equal(
      (
        await emit(a, "chat:message:send", {
          roomId,
          content: "After revocation",
        })
      ).success,
      true,
    );
    await disconnected;
    assert.equal(b.connected, false);
  } finally {
    for (const s of sockets) s.disconnect();
    await new Promise((resolve) => realtimeServer.close(resolve));
    if (server.listening) await new Promise((resolve) => server.close(resolve));
  }
});

test("parent–teacher conversations stay private and follow student revocation", async () => {
  const t = await teacher(),
    s = await register(),
    parent = await register("Parent"),
    stranger = await register();
  const c = await course(t);
  await call(s, "post", `/api/courses/${c}/enroll`, {});
  const invite = await call(s, "post", "/api/parent-links/invite", {});
  await call(parent, "post", "/api/parent-links/accept", {
    code: invite.body.data.code,
  });
  const teachers = await call(
    parent,
    "get",
    `/api/parent-links/${s.id}/teachers`,
  );
  assert.equal(teachers.status, 200);
  assert.ok(teachers.body.data.some((u) => u.id === t.id));
  const conversation = await call(
    parent,
    "post",
    `/api/parent-links/${s.id}/conversations`,
    { teacherId: t.id },
  );
  assert.equal(conversation.status, 200, JSON.stringify(conversation.body));
  const rid = conversation.body.data.id;
  const rooms = await call(stranger, "get", "/api/rooms/active");
  assert.ok(!rooms.body.data.some((r) => r.id === rid));
  assert.equal(
    (await call(stranger, "post", `/api/rooms/${rid}/join`, {})).status,
    403,
  );
  assert.equal(
    (
      await call(parent, "post", `/api/rooms/${rid}/messages`, {
        content: "How can I support revision?",
      })
    ).status,
    201,
  );
  assert.equal(
    (await call(t, "get", `/api/rooms/${rid}/messages`)).status,
    200,
  );
  await call(s, "delete", `/api/parent-links/${parent.id}`);
  assert.equal(
    (await call(parent, "get", `/api/rooms/${rid}/messages`)).status,
    403,
  );
});

test("private attachments encrypt bytes, enforce membership, reject unsupported files and tampering", async () => {
  process.env.FILE_STORAGE_KEY = "c".repeat(64);
  const t = await teacher(),
    s = await register(),
    other = await register();
  const c = await course(t);
  await call(s, "post", `/api/courses/${c}/enroll`, {});
  const pdf = Buffer.from("%PDF-1.4\nTest educational attachment\n%%EOF");
  const upload = (user, bytes) =>
    request(app)
      .post(`/api/courses/${c}/files`)
      .query({ title: "Practice", name: "../../exercise.pdf" })
      .set("Origin", origin)
      .set("Cookie", user.cookies)
      .set("X-CSRF-Token", user.csrf)
      .set("Content-Type", "application/octet-stream")
      .send(bytes);
  assert.equal((await upload(s, pdf)).status, 403);
  assert.equal(
    (await upload(t, Buffer.from("<script>evil</script>"))).status,
    400,
  );
  const response = await upload(t, pdf);
  assert.equal(response.status, 201, JSON.stringify(response.body));
  const fid = response.body.data.id;
  const stored = await M.PrivateFile.findById(fid).select(
    "+ciphertext +nonce +tag",
  );
  assert.notDeepEqual(stored.ciphertext, pdf);
  const listing = await call(s, "get", `/api/courses/${c}/files`);
  assert.equal(listing.body.data[0].ciphertext, undefined);
  assert.equal(
    (await call(other, "get", `/api/files/${fid}/download`)).status,
    403,
  );
  const downloaded = await call(s, "get", `/api/files/${fid}/download`);
  assert.equal(downloaded.status, 200);
  assert.deepEqual(downloaded.body, pdf);
  assert.match(downloaded.headers["content-disposition"], /^attachment;/);
  assert.ok(!downloaded.headers["content-disposition"].includes("../"));
  stored.ciphertext[0] ^= 1;
  stored.markModified("ciphertext");
  await stored.save();
  assert.equal(
    (await call(s, "get", `/api/files/${fid}/download`)).status,
    500,
  );
  await call(t, "delete", `/api/files/${fid}`);
  assert.equal(await M.PrivateFile.countDocuments({ _id: fid }), 0);
  delete process.env.FILE_STORAGE_KEY;
});

test("institution enrolment and downloads are revoked with membership", async () => {
  const admin = await teacher(),
    t = await teacher(),
    s = await register(),
    other = await register();
  await M.User.updateOne({ _id: admin.id }, { $set: { role: "admin" } });
  const response = await call(admin, "post", "/api/admin/institutions", {
    name: "Learning Centre",
  });
  assert.equal(response.status, 201);
  const institutionId = response.body.data.id;
  assert.equal(
    (await call(t, "post", "/api/admin/institutions", { name: "Forbidden" }))
      .status,
    403,
  );
  for (const user of [t, s])
    assert.equal(
      (
        await call(
          admin,
          "put",
          `/api/admin/institutions/${institutionId}/members`,
          { email: user.email },
        )
      ).status,
      200,
    );
  const cr = await call(t, "post", "/api/courses", {
    title: "Institution Algebra",
    track: "11 · JEE",
    institutionId,
    published: true,
  });
  assert.equal(cr.status, 201, JSON.stringify(cr.body));
  const c = cr.body.data.id;
  assert.equal(
    (await call(other, "post", `/api/courses/${c}/enroll`, {})).status,
    403,
  );
  assert.equal(
    (await call(s, "post", `/api/courses/${c}/enroll`, {})).status,
    200,
  );
  assert.equal((await call(s, "get", `/api/courses/${c}/lessons`)).status, 200);
  await call(
    admin,
    "delete",
    `/api/admin/institutions/${institutionId}/members/${s.id}`,
  );
  assert.equal((await call(s, "get", `/api/courses/${c}/lessons`)).status, 403);
  assert.ok(
    !(await call(s, "get", "/api/courses")).body.data.some(
      (course) => course.id === c,
    ),
  );
});

test("curriculum imports are validated, private until review, and edits invalidate sourced content approval", async () => {
  const t = await teacher(),
    outsider = await teacher(),
    s = await register();
  const source =
    "https://openstax.org/books/elementary-algebra-2e/pages/2-introduction";
  const pack = {
    title: "Starter",
    description: "Original starter",
    track: "11 · JEE",
    syllabus: "Linear equations",
    sources: [source],
    lessons: [
      {
        title: "Equations",
        subject: "Math",
        chapter: "Algebra",
        content: "Subtract equally.",
        workedExample: "x + 2 = 5 gives x = 3.",
        revisionNotes: "Check by substitution.",
        sourceUrl: source,
      },
    ],
    tests: [
      {
        title: "Check",
        durationMinutes: 10,
        questions: [
          {
            prompt: "x + 2 = 5. Find x.",
            options: ["3", "7"],
            correctIndex: 0,
            explanation: "Subtract 2 from both sides.",
            topic: "Equations",
          },
        ],
      },
    ],
  };
  assert.equal(
    (await call(s, "post", "/api/curriculum/import", pack)).status,
    403,
  );
  const r = await call(t, "post", "/api/curriculum/import", pack);
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const c = r.body.data.id;
  assert.equal(
    (await call(t, "patch", `/api/courses/${c}`, { published: true })).status,
    409,
  );
  assert.equal(
    (await call(outsider, "get", `/api/courses/${c}/review`)).status,
    403,
  );
  const review = (await call(t, "get", `/api/courses/${c}/review`)).body.data;
  assert.equal(review.tests[0].questions[0].correctIndex, 0);
  assert.equal(
    (await call(t, "post", `/api/courses/${c}/review`, { confirmed: true }))
      .status,
    200,
  );
  assert.equal(
    (await call(t, "patch", `/api/courses/${c}`, { published: true })).status,
    200,
  );
  const changed = await call(
    t,
    "patch",
    `/api/lessons/${review.lessons[0].id}`,
    { content: "Updated original explanation." },
  );
  assert.equal(changed.status, 200);
  assert.equal((await M.Course.findById(c)).published, false);
  assert.equal((await M.Course.findById(c)).reviewRequired, true);
});

test("account export hides assessment keys and deletion revokes sessions and removes personal learning data", async () => {
  const s = await register(),
    t = await teacher(),
    c = await course(t);
  await call(s, "post", `/api/courses/${c}/enroll`, {});
  const tst = await call(t, "post", "/api/tests", {
    courseId: c,
    title: "Export boundaries",
    durationMinutes: 10,
    published: true,
    questions: [
      {
        prompt: "Secret key?",
        options: ["A", "B"],
        correctIndex: 1,
        explanation: "Hidden until submission",
        topic: "Privacy",
      },
    ],
  });
  await call(s, "post", `/api/tests/${tst.body.data.id}/start`, {});
  const exported = await call(s, "get", "/api/account/export");
  assert.equal(exported.status, 200);
  assert.equal(exported.body.user.email, s.email);
  assert.equal(exported.body.records.Attempt[0].questions, undefined);
  assert.equal(
    (
      await call(s, "delete", "/api/account", {
        password: "wrong",
        confirmation: "DELETE MY ACCOUNT",
      })
    ).status,
    400,
  );
  const deleted = await call(s, "delete", "/api/account", {
    password: secret,
    confirmation: "DELETE MY ACCOUNT",
  });
  assert.equal(deleted.status, 200, JSON.stringify(deleted.body));
  assert.equal((await call(s, "get", "/api/auth/me")).status, 401);
  assert.equal(await M.Attempt.countDocuments({ studentId: s.id }), 0);
  assert.equal(await M.Enrollment.countDocuments({ studentId: s.id }), 0);
  const u = await M.User.findById(s.id);
  assert.equal(u.isDeleted, true);
  assert.notEqual(u.email, s.email);
});

test("sectioned mocks reveal only the active section and lock earlier answers", async () => {
  const t = await teacher(),
    s = await register(),
    c = await course(t);
  await call(s, "post", `/api/courses/${c}/enroll`, {});
  const questions = [
    {
      prompt: "First section",
      options: ["A", "B"],
      correctIndex: 0,
      explanation: "First explanation",
      topic: "First",
    },
    {
      prompt: "Second section",
      options: ["A", "B"],
      correctIndex: 1,
      explanation: "Second explanation",
      topic: "Second",
    },
  ];
  const data = {
    courseId: c,
    title: "Sectioned practice",
    durationMinutes: 2,
    published: true,
    questions,
    sections: [
      { name: "First", durationMinutes: 1, questionCount: 1 },
      { name: "Second", durationMinutes: 1, questionCount: 1 },
    ],
  };
  assert.equal(
    (await call(t, "post", "/api/tests", { ...data, durationMinutes: 3 }))
      .status,
    400,
  );
  const created = await call(t, "post", "/api/tests", data);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const tid = created.body.data.id;
  const first = (await call(s, "post", `/api/tests/${tid}/start`, {})).body
    .data;
  assert.equal(first.section.name, "First");
  assert.equal(first.questions.length, 1);
  assert.equal(first.questions[0].prompt, "First section");
  assert.equal(first.questions[0].correctIndex, undefined);
  const q1 = first.questions[0].id;
  assert.equal(
    (
      await call(s, "put", `/api/tests/${tid}/answers`, {
        answers: { [q1]: 0 },
      })
    ).status,
    200,
  );
  await M.Attempt.updateOne(
    { studentId: s.id, testId: tid },
    { $set: { startedAt: new Date(Date.now() - 61000) } },
  );
  const second = (await call(s, "post", `/api/tests/${tid}/start`, {})).body
    .data;
  assert.equal(second.section.name, "Second");
  assert.equal(second.questions[0].prompt, "Second section");
  const q2 = second.questions[0].id;
  assert.equal(
    (
      await call(s, "put", `/api/tests/${tid}/answers`, {
        answers: { [q1]: 1, [q2]: 1 },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call(s, "put", `/api/tests/${tid}/answers`, {
        answers: { [q1]: 0, [q2]: 1 },
      })
    ).status,
    200,
  );
  const result = await call(s, "post", `/api/tests/${tid}/submit`, {
    answers: { [q2]: 1 },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.correct, 2);
});

test("SMTP verification/reset links are single-use and do not expose tokens in API responses", async () => {
  const nodemailer = require("nodemailer"),
    original = nodemailer.createTransport,
    mails = [];
  const previous = {
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_FROM_EMAIL: process.env.MAIL_FROM_EMAIL,
  };
  process.env.MAIL_HOST = "smtp.example.test";
  process.env.MAIL_FROM_EMAIL = "sender@example.test";
  nodemailer.createTransport = () => ({
    sendMail: async (mail) => {
      mails.push(mail);
    },
  });
  try {
    const s = await register();
    mails.length = 0;
    const response = await call(s, "post", "/api/auth/resend-verification", {});
    assert.equal(response.status, 200);
    assert.equal(response.body.token, undefined);
    const token = new URL(
      mails.at(-1).text.match(/https?:\/\/\S+/)[0],
    ).hash.slice(1);
    assert.equal(
      (await call(null, "post", "/api/auth/verify-email", { token })).status,
      200,
    );
    assert.equal(
      (await call(null, "post", "/api/auth/verify-email", { token })).status,
      400,
    );
    await call(null, "post", "/api/auth/forgot-password", { email: s.email });
    const reset = new URL(
      mails.at(-1).text.match(/https?:\/\/\S+/)[0],
    ).hash.slice(1);
    assert.equal(
      (
        await call(null, "post", "/api/auth/reset-password", {
          token: reset,
          password: "AnotherStrong123!",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await call(null, "post", "/api/auth/reset-password", {
          token: reset,
          password: "AnotherStrong123!",
        })
      ).status,
      400,
    );
    assert.equal((await call(s, "get", "/api/auth/me")).status, 401);
  } finally {
    nodemailer.createTransport = original;
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});
