const serverRequire = require("node:module").createRequire(
  require("node:path").join(__dirname, "../server/package.json"),
);
const clientRequire = require("node:module").createRequire(
  require("node:path").join(__dirname, "../client/package.json"),
);
process.env.NODE_ENV = "test";
process.env.FILE_STORAGE_KEY = require("node:crypto")
  .randomBytes(32)
  .toString("hex");
const { MongoMemoryServer } = serverRequire("mongodb-memory-server");
const mongoose = serverRequire("mongoose");
const bcrypt = serverRequire("bcryptjs");
const http = require("node:http");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const { createApp } = require("../server/app");
const M = require("../server/models");
const { realtime } = require("../server/modules/realtime");
(async () => {
  const db = await MongoMemoryServer.create({
    instance: { args: ["--nounixsocket", "--wiredTigerCacheSizeGB", "0.25"] },
  });
  await mongoose.connect(db.getUri());
  await Promise.all(Object.values(M).map((m) => m.init()));
  const teacher = await M.User.create({
    name: "Test Teacher",
    email: "teacher@example.test",
    password: await bcrypt.hash("TestOnlyPassword123!", 12),
    role: "teacher",
    emailVerified: true,
  });
  const c = await M.Course.create({
    ownerId: teacher._id,
    title: "E2E Algebra",
    description: "Browser test course",
    track: "11 · JEE",
    published: true,
  });
  await M.Lesson.create({
    courseId: c._id,
    title: "Linear equations",
    chapter: "Equations",
    subject: "Math",
    content:
      "Solve x + 2 = 5 by subtracting 2 from both sides. Therefore x = 3.",
    order: 0,
  });
  await M.Test.create({
    courseId: c._id,
    ownerId: teacher._id,
    title: "E2E Linear Quiz",
    durationMinutes: 10,
    published: true,
    questions: [
      {
        id: "e2e-question",
        prompt: "What is x when x + 2 = 5?",
        options: ["3", "7"],
        correctIndex: 0,
        explanation: "Subtract 2 from both sides to get x = 3.",
        topic: "Equations",
        marks: 4,
        negativeMarks: 1,
      },
    ],
  });
  const app = createApp({
    NODE_ENV: "test",
    secure: false,
    TRUST_PROXY: 0,
    origins: ["http://localhost:5173"],
    JWT_ACCESS_SECRET: crypto.randomBytes(32).toString("hex"),
    JWT_REFRESH_SECRET: crypto.randomBytes(32).toString("hex"),
  });
  const server = http.createServer(app);
  const io = realtime(server, app);
  await new Promise((r) => server.listen(5000, "127.0.0.1", r));
  const vite = spawn(
    process.execPath,
    [
      require("node:path").join(
        clientRequire.resolve("vite/package.json"),
        "../bin/vite.js",
      ),
      "--host",
      "127.0.0.1",
      "--port",
      "5173",
      "--strictPort",
    ],
    {
      cwd: require("node:path").join(__dirname, "../client"),
      stdio: "inherit",
    },
  );
  const stop = async () => {
    vite.kill("SIGTERM");
    io.close();
    server.close();
    await mongoose.disconnect();
    await db.stop();
    process.exit(0);
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
})().catch(() => {
  console.error("E2E server failed to start");
  process.exit(1);
});
