require("dotenv").config({ quiet: true });
const http = require("node:http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { createApp } = require("./app");
const { loadConfig } = require("./lib/config");
const models = require("./models");
const { User } = models;
const { realtime } = require("./modules/realtime");
async function main() {
  const config = loadConfig();
  await mongoose.connect(config.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: config.NODE_ENV !== "production",
  });
  await Promise.all(
    [...Object.values(models), require("./lib/rate-store").Counter].map(
      (model) => model.createIndexes(),
    ),
  );
  // Provision an administrator once through server-only environment settings. Never overwrite an existing account.
  if (
    process.env.ADMIN_EMAIL &&
    !(await User.exists({ email: process.env.ADMIN_EMAIL.toLowerCase() }))
  ) {
    const { password } = require("./lib/security");
    if (
      !password.safeParse(process.env.ADMIN_PASSWORD).success ||
      !/^[A-Z2-7]{32,}$/i.test(process.env.ADMIN_TOTP_SECRET || "")
    )
      throw Error(
        "Administrator requires a strong password and base32 TOTP secret",
      );
    await User.create({
      name: "Administrator",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: "admin",
      emailVerified: true,
      consentedAt: new Date(),
    });
  }
  const app = createApp(config);
  const server = http.createServer(app);
  const io = realtime(server, app);
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.listen(config.PORT, () => process.stdout.write("ADHAYAN API ready\n"));
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 10000).unref();
    io.close();
    server.close(async () => {
      await mongoose.disconnect();
      clearTimeout(timeout);
      process.exit(0);
    });
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  process.on("unhandledRejection", () => {
    process.stderr.write("Unhandled service failure\n");
    stop();
  });
  process.on("uncaughtException", () => {
    process.stderr.write("Unexpected service failure\n");
    stop();
  });
}
main().catch(() => {
  process.stderr.write(
    "Startup failed. Check server configuration and database availability.\n",
  );
  process.exitCode = 1;
});
