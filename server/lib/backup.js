const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const { EJSON } = require("mongoose").mongo.BSON;
const MAX_BYTES = 64 * 1024 * 1024;
const MAGIC = Buffer.from("ADHYBKP1");
const excluded = new Set([
  "adhayan_sessions",
  "adhayan_action_tokens",
  "adhayan_rate_counters",
]);
function keyFrom(hex) {
  if (!/^[a-f\d]{64}$/i.test(hex || ""))
    throw Error("BACKUP_KEY must contain exactly 64 hexadecimal characters.");
  return Buffer.from(hex, "hex");
}
async function backup(db, file, keyHex) {
  const key = keyFrom(keyHex);
  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();
  const records = {};
  let bytes = 0;
  for (const { name } of collections) {
    if (name.startsWith("system.") || excluded.has(name)) continue;
    records[name] = [];
    for await (const doc of db.collection(name).find({})) {
      bytes += Buffer.byteLength(EJSON.stringify(doc));
      if (bytes > MAX_BYTES)
        throw Error(
          "Backup exceeds 64 MiB. Use managed database snapshots for larger datasets.",
        );
      records[name].push(doc);
    }
  }
  const raw = Buffer.from(
    EJSON.stringify({ version: 1, createdAt: new Date(), records }),
  );
  if (raw.length > MAX_BYTES) throw Error("Backup exceeds size limit.");
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
  const encrypted = Buffer.concat([cipher.update(raw), cipher.final()]);
  const data = Buffer.concat([MAGIC, nonce, cipher.getAuthTag(), encrypted]);
  await fs.writeFile(file, data, { flag: "wx", mode: 0o600 });
  return Object.fromEntries(
    Object.entries(records).map(([name, docs]) => [name, docs.length]),
  );
}
async function restore(db, file, keyHex) {
  // Restoration never drops or overwrites a database. Restore to a new isolated database, then review it.
  if (!/^adhayan_restore_[a-zA-Z0-9_]+$/.test(db.databaseName))
    throw Error("Restore database must be named adhayan_restore_<name>.");
  if ((await db.listCollections({}, { nameOnly: true }).toArray()).length)
    throw Error("Restore target must be empty.");
  const stat = await fs.stat(file);
  if (stat.size > MAX_BYTES + 1024 || stat.size < 36)
    throw Error("Invalid backup size.");
  const data = await fs.readFile(file);
  if (!data.subarray(0, 8).equals(MAGIC)) throw Error("Invalid backup format.");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyFrom(keyHex),
    data.subarray(8, 20),
  );
  decipher.setAuthTag(data.subarray(20, 36));
  // Verify the complete authentication tag before writing any restored records.
  const raw = Buffer.concat([
    decipher.update(data.subarray(36)),
    decipher.final(),
  ]);
  const parsed = EJSON.parse(raw.toString());
  if (
    parsed.version !== 1 ||
    !parsed.records ||
    typeof parsed.records !== "object"
  )
    throw Error("Invalid backup contents.");
  const counts = {};
  for (const [name, docs] of Object.entries(parsed.records)) {
    if (
      !/^[a-zA-Z0-9_-]+$/.test(name) ||
      excluded.has(name) ||
      !Array.isArray(docs)
    )
      throw Error("Invalid backup collection.");
    if (docs.length)
      await db.collection(name).insertMany(docs, { ordered: true });
    else await db.createCollection(name);
    counts[name] = docs.length;
    if ((await db.collection(name).countDocuments()) !== docs.length)
      throw Error("Restore count verification failed.");
  }
  if (counts.users)
    await db.collection("users").updateMany({}, { $inc: { tokenVersion: 1 } });
  return counts;
}
module.exports = { backup, restore };
