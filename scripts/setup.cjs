const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const dest = path.join(__dirname, "../server/.env");
if (fs.existsSync(dest)) {
  console.error("server/.env already exists. No values were changed.");
  process.exitCode = 1;
} else {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "",
    totp = "";
  for (const b of crypto.randomBytes(20))
    bits += b.toString(2).padStart(8, "0");
  for (let i = 0; i < bits.length; i += 5)
    totp += alphabet[parseInt(bits.slice(i, i + 5), 2)];
  let env = fs.readFileSync(
    path.join(__dirname, "../server/.env.example"),
    "utf8",
  );
  for (const name of [
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "BACKUP_KEY",
    "FILE_STORAGE_KEY",
  ])
    env = env.replace(
      new RegExp(`^${name}=$`, "m"),
      `${name}=${crypto.randomBytes(32).toString("hex")}`,
    );
  env = env.replace(/^ADMIN_TOTP_SECRET=$/m, `ADMIN_TOTP_SECRET=${totp}`);
  fs.writeFileSync(dest, env, { flag: "wx", mode: 0o600 });
  console.log(
    "Created server/.env with independent random keys. Add your new database URI, administrator email/password and provider settings locally. Import ADMIN_TOTP_SECRET into your authenticator manually. Never share or commit this file.",
  );
}
