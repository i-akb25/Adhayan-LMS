const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const bad = [];
for (const f of files) {
  if (/(^|\/)\.env(?:\.|$)/.test(f) && !f.endsWith(".example")) bad.push(f);
  if (/(^|\/)(node_modules|dist|build|logs|uploads|backups)\//.test(f))
    bad.push(f);
  if (
    !fs.existsSync(f) ||
    !/\.(js|jsx|json|ya?ml|example)$/.test(f) ||
    f.endsWith("lock.json")
  )
    continue;
  const s = fs.readFileSync(f, "utf8");
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}|\bAIza[0-9A-Za-z_-]{30,}|mongodb(?:\+srv)?:\/\/[^\s'"<>/]+:[^\s'"<>/]+@/.test(
      s,
    )
  )
    bad.push(f);
}
if (bad.length) {
  console.error(
    "Repository security check failed for paths:",
    [...new Set(bad)].join(", "),
  );
  process.exit(1);
}
console.log("Repository hygiene check passed.");
