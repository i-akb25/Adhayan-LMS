const path = require("node:path"),
  { createRequire } = require("node:module");
const serverRequire = createRequire(
  path.join(__dirname, "../server/package.json"),
);
serverRequire("dotenv").config({
  path: path.join(__dirname, "../server/.env"),
  quiet: true,
});
async function main() {
  const { loadConfig } = require("../server/lib/config");
  let config;
  try {
    config = loadConfig();
    console.log("Core configuration: valid");
  } catch {
    console.error(
      "Core configuration: invalid. Check database URI, distinct authentication keys and exact frontend origins.",
    );
    process.exitCode = 1;
    return;
  }
  const checks = {
    email: !!(process.env.MAIL_HOST && process.env.MAIL_FROM_EMAIL),
    ai: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL),
    calls: !!(process.env.TURN_URL && process.env.TURN_SHARED_SECRET),
    files: /^[a-f\d]{64}$/i.test(process.env.FILE_STORAGE_KEY || ""),
    backups: /^[a-f\d]{64}$/i.test(process.env.BACKUP_KEY || ""),
    administrator: !!(
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_TOTP_SECRET
    ),
    support: !!(process.env.OPERATOR_NAME && process.env.SUPPORT_EMAIL),
  };
  for (const [name, configured] of Object.entries(checks))
    console.log(
      `${name}: ${configured ? "configured" : "missing configuration"}`,
    );
  if (process.argv.includes("--providers")) {
    const mongoose = serverRequire("mongoose");
    try {
      await mongoose.connect(config.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      await mongoose.connection.db.command({ ping: 1 });
      console.log("Database connectivity: passed");
    } catch {
      console.log("Database connectivity: failed");
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
    if (checks.email) {
      const transport = serverRequire("nodemailer").createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT || 587),
        secure: process.env.MAIL_SECURE === "true",
        connectionTimeout: 5000,
        socketTimeout: 5000,
        ...(process.env.MAIL_USER
          ? {
              auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
              },
            }
          : {}),
      });
      try {
        await transport.verify();
        console.log("SMTP connection/authentication: passed (no email sent)");
      } catch {
        console.log("SMTP connection/authentication: failed");
        process.exitCode = 1;
      } finally {
        transport.close();
      }
    }
  }
  console.log(
    "Presence checks do not verify AI answers, email delivery, cross-network calls or backup scheduling.",
  );
}
main().catch(() => {
  console.error("Configuration check failed. No credentials were printed.");
  process.exitCode = 1;
});
