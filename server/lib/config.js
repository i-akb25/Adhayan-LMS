const { z } = require("zod");
function loadConfig(env = process.env) {
  const schema = z.object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    CLIENT_URL: z.string().default("http://localhost:5173"),
    MONGO_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
    FILE_STORAGE_KEY: z
      .union([z.string().regex(/^[a-f\d]{64}$/i), z.literal("")])
      .default(""),
    BACKUP_KEY: z
      .union([z.string().regex(/^[a-f\d]{64}$/i), z.literal("")])
      .default(""),
    BACKUP_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
    OPERATOR_NAME: z.string().max(200).default(""),
    SUPPORT_EMAIL: z.union([z.string().email(), z.literal("")]).default(""),
  });
  const parsed = schema.safeParse(env);
  if (!parsed.success)
    throw new Error(
      "Invalid server configuration: " +
        [...new Set(parsed.error.issues.map((i) => i.path.join(".")))].join(
          ", ",
        ),
    );
  const c = parsed.data;
  c.origins = c.CLIENT_URL.split(",").map((s) => s.trim());
  for (const origin of c.origins) {
    const u = new URL(origin);
    if (
      u.origin !== origin ||
      (c.NODE_ENV === "production" && u.protocol !== "https:") ||
      !["http:", "https:"].includes(u.protocol)
    )
      throw new Error("CLIENT_URL must contain exact trusted origins");
  }
  if (c.JWT_ACCESS_SECRET === c.JWT_REFRESH_SECRET)
    throw new Error("Authentication secrets must differ");
  const keys = [
    c.JWT_ACCESS_SECRET,
    c.JWT_REFRESH_SECRET,
    c.FILE_STORAGE_KEY,
    c.BACKUP_KEY,
  ].filter(Boolean);
  if (new Set(keys).size !== keys.length)
    throw new Error("Encryption and authentication keys must be independent");
  c.secure = c.NODE_ENV === "production";
  return c;
}
module.exports = { loadConfig };
