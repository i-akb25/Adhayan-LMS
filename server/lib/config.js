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
  c.secure = c.NODE_ENV === "production";
  return c;
}
module.exports = { loadConfig };
