const serverRequire = require("node:module").createRequire(
  require("node:path").join(__dirname, "../server/package.json"),
);
serverRequire("dotenv").config({
  path: require("node:path").join(__dirname, "../server/.env"),
  quiet: true,
});
const mongoose = serverRequire("mongoose");
const { backup, restore } = require("../server/lib/backup");
async function main() {
  const [action, requestedFile] = process.argv.slice(2);
  let file = requestedFile;
  if (action === "backup" && !file) {
    const path = require("node:path"),
      fs = require("node:fs/promises");
    const directory = path.resolve(
      path.join(__dirname, "../server"),
      process.env.BACKUP_DIRECTORY || "./backups",
    );
    await fs.mkdir(directory, { recursive: true, mode: 0o700 });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    file = path.join(directory, `adhayan-${stamp}.adhb`);
  }
  if (!["backup", "restore"].includes(action) || !file)
    throw Error(
      "Use: node scripts/database-backup.cjs backup|restore <encrypted-file>",
    );
  if (!process.env.MONGO_URI) throw Error("MONGO_URI is required.");
  if (action === "backup" && process.env.BACKUP_WRITES_PAUSED !== "true")
    throw Error(
      "Pause application writes and set BACKUP_WRITES_PAUSED=true before exporting.",
    );
  if (action === "restore" && !process.env.RESTORE_DATABASE)
    throw Error("RESTORE_DATABASE is required.");
  await mongoose.connect(
    process.env.MONGO_URI,
    action === "restore" ? { dbName: process.env.RESTORE_DATABASE } : {},
  );
  const result = await (action === "backup" ? backup : restore)(
    mongoose.connection.db,
    file,
    process.env.BACKUP_KEY,
  );
  console.log(
    action === "backup"
      ? "Encrypted backup created."
      : "Restore verified in isolated database.",
  );
  console.log("Collections:", Object.keys(result).length);
}
main()
  .catch((error) => {
    console.error(
      "Database backup/restore failed. Check configuration, encryption key and target database.",
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
