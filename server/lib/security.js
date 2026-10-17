const crypto = require("node:crypto");
const { z } = require("zod");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const token = () => crypto.randomBytes(32).toString("base64url");
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const parse = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success)
    fail(400, "Invalid request. Check the required fields and limits.");
  return result.data;
};
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const text = (max = 200) => z.string().trim().min(1).max(max);
const password = z
  .string()
  .min(12)
  .max(72)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/\d/)
  .regex(/[^A-Za-z0-9]/)
  .refine((p) => Buffer.byteLength(p, "utf8") <= 72);
const publicUser = (u) => ({
  id: String(u._id),
  name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" "),
  email: u.email,
  role: u.role,
  avatar: u.avatar || "",
  emailVerified: !!u.emailVerified,
  track: u.track || "",
  theme: u.theme || "system",
  bio: u.bio || "",
  phone: u.phone || "",
  createdAt: u.createdAt,
});
const safeUrl = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  });
function rejectOperators(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, v] of Object.entries(value)) {
    if (
      key.startsWith("$") ||
      key.includes(".") ||
      ["__proto__", "prototype", "constructor"].includes(key)
    )
      fail(400, "Invalid request field");
    rejectOperators(v);
  }
}
function decodeBase32(s) {
  let bits = "";
  for (const c of s.toUpperCase().replace(/=+$/, "")) {
    const i = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);
    if (i < 0) return null;
    bits += i.toString(2).padStart(5, "0");
  }
  return Buffer.from((bits.match(/.{8}/g) || []).map((b) => parseInt(b, 2)));
}
function verifyTotp(secret, code, now = Date.now()) {
  if (!/^\d{6}$/.test(String(code))) return false;
  const key = decodeBase32(secret || "");
  if (!key || key.length < 20) return false;
  for (let d = -1; d <= 1; d++) {
    const b = Buffer.alloc(8);
    b.writeBigUInt64BE(BigInt(Math.floor(now / 30000) + d));
    const h = crypto.createHmac("sha1", key).update(b).digest();
    const o = h[h.length - 1] & 15;
    const n = ((h.readUInt32BE(o) & 0x7fffffff) % 1000000)
      .toString()
      .padStart(6, "0");
    if (crypto.timingSafeEqual(Buffer.from(n), Buffer.from(String(code))))
      return true;
  }
  return false;
}
function grade(questions, answers) {
  const topics = {};
  let score = 0,
    maximum = 0,
    correct = 0;
  const review = questions.map((q) => {
    const selected = answers[q.id] ?? null;
    const ok = selected === q.correctIndex;
    maximum += q.marks;
    const marks = selected === null ? 0 : ok ? q.marks : -q.negativeMarks;
    score += marks;
    correct += ok ? 1 : 0;
    const t = (topics[q.topic] ||= { topic: q.topic, correct: 0, total: 0 });
    t.total++;
    t.correct += ok ? 1 : 0;
    return {
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      selected,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      marks,
    };
  });
  return {
    score,
    maximum,
    percentage: maximum ? Math.max(0, (score / maximum) * 100) : 0,
    correct,
    total: questions.length,
    review,
    topics: Object.values(topics).map((t) => ({
      ...t,
      accuracy: Math.round((t.correct / t.total) * 100),
    })),
  };
}
module.exports = {
  hash,
  token,
  HttpError,
  fail,
  wrap,
  parse,
  objectId,
  text,
  password,
  publicUser,
  safeUrl,
  rejectOperators,
  verifyTotp,
  grade,
};
