const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../lib/config");
const {
  grade,
  rejectOperators,
  safeUrl,
  password,
  verifyTotp,
} = require("../lib/security");
const config = {
  MONGO_URI: "mongodb://127.0.0.1/test",
  JWT_ACCESS_SECRET: "a".repeat(32),
  JWT_REFRESH_SECRET: "b".repeat(32),
};
test("production configuration rejects weak secrets and wildcard or non-HTTPS origins", () => {
  assert.throws(() => loadConfig({ ...config, JWT_ACCESS_SECRET: "weak" }));
  assert.throws(() =>
    loadConfig({ ...config, JWT_REFRESH_SECRET: config.JWT_ACCESS_SECRET }),
  );
  assert.throws(() => loadConfig({ ...config, CLIENT_URL: "*" }));
  assert.throws(() =>
    loadConfig({
      ...config,
      NODE_ENV: "production",
      CLIENT_URL: "http://example.com",
    }),
  );
  assert.equal(
    loadConfig({
      ...config,
      NODE_ENV: "production",
      CLIENT_URL: "https://example.com",
    }).secure,
    true,
  );
});
test("nested operator injection and prototype fields are rejected", () => {
  assert.throws(() => rejectOperators({ email: { $ne: null } }));
  assert.throws(() =>
    rejectOperators(JSON.parse('{"__proto__":{"admin":true}}')),
  );
  assert.throws(() => rejectOperators({ a: [{ "x.y": 1 }] }));
  assert.doesNotThrow(() =>
    rejectOperators({ name: "A name", answers: { q: 0 } }),
  );
});
test("resource links reject executable schemes and embedded credentials", () => {
  assert.equal(safeUrl.safeParse("javascript:alert(1)").success, false);
  assert.equal(
    safeUrl.safeParse("https://user:pass@example.com/file").success,
    false,
  );
  assert.equal(safeUrl.safeParse("https://example.com/file.pdf").success, true);
});
test("password bounds account for bcrypt UTF-8 byte truncation", () => {
  assert.equal(password.safeParse("weak").success, false);
  assert.equal(password.safeParse("ValidPassword123!").success, true);
  assert.equal(password.safeParse("É".repeat(40) + "Aa1!").success, false);
});
test("server grading ignores forged totals and calculates weak topics", () => {
  const qs = [
    {
      id: "q1",
      prompt: "P",
      options: ["a", "b"],
      correctIndex: 1,
      marks: 4,
      negativeMarks: 1,
      topic: "Algebra",
      explanation: "E",
    },
    {
      id: "q2",
      prompt: "Q",
      options: ["a", "b"],
      correctIndex: 0,
      marks: 4,
      negativeMarks: 1,
      topic: "Geometry",
      explanation: "E",
    },
  ];
  const r = grade(qs, { q1: 0, q2: 0, score: 999 });
  assert.equal(r.score, 3);
  assert.equal(r.maximum, 8);
  assert.equal(r.correct, 1);
  assert.equal(r.topics[0].accuracy, 0);
  assert.equal(grade(qs, {}).score, 0);
});
test("TOTP validates the RFC test vector and rejects missing or malformed secrets", () => {
  assert.equal(
    verifyTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "287082", 59000),
    true,
  );
  assert.equal(verifyTotp("", "287082", 59000), false);
  assert.equal(
    verifyTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "000000", 59000),
    false,
  );
});
