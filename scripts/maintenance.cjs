const path = require("node:path"),
  fs = require("node:fs/promises"),
  { createRequire } = require("node:module");
const sr = createRequire(path.join(__dirname, "../server/package.json"));
sr("dotenv").config({
  path: path.join(__dirname, "../server/.env"),
  quiet: true,
});
const mongoose = sr("mongoose");
async function main() {
  const apply = process.argv.includes("--apply");
  if (!process.env.MONGO_URI) throw Error("Configure the database first.");
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  const M = require("../server/models"),
    { purgeAccount } = require("../server/modules/operations");
  const pending = await M.User.find({
    deletionRequestedAt: { $ne: null },
    isDeleted: { $ne: true },
    role: { $ne: "admin" },
  })
    .limit(100)
    .select("_id");
  console.log(`Pending account cleanups: ${pending.length}`);
  if (apply) for (const u of pending) await purgeAccount(u._id);
  const directory = path.resolve(
    path.join(__dirname, "../server"),
    process.env.BACKUP_DIRECTORY || "./backups",
  );
  const days = Number(process.env.BACKUP_RETENTION_DAYS || 30);
  if (!Number.isInteger(days) || days < 1 || days > 365)
    throw Error("Invalid retention period.");
  let entries;
  try {
    const info = await fs.lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink())
      throw Error("Backup directory must be a real directory.");
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") entries = [];
    else throw e;
  }
  let count = 0;
  for (const entry of entries) {
    if (!entry.isFile() || !/^adhayan-[0-9TZ_-]+\.adhb$/.test(entry.name))
      continue;
    const file = path.join(directory, entry.name),
      stat = await fs.lstat(file);
    if (stat.mtimeMs > Date.now() - days * 86400000) continue;
    const handle = await fs.open(file, "r");
    let header = Buffer.alloc(8);
    try {
      await handle.read(header, 0, 8, 0);
    } finally {
      await handle.close();
    }
    if (header.toString() !== "ADHYBKP1") continue;
    count++;
    if (apply) await fs.unlink(file);
  }
  console.log(
    `Expired encrypted backups: ${count}. ${apply ? "Changes applied." : "Dry run only. Use --apply to run cleanup."}`,
  );
}
main()
  .catch(() => {
    console.error(
      "Maintenance failed. Check database access, backup directory and retention settings. No credentials were printed.",
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
