const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");
const { loadConfig } = require("./lib/config");
const { HttpError, rejectOperators } = require("./lib/security");
const { createAuth } = require("./modules/auth");
const { createLearning } = require("./modules/learning");
const { createAI } = require("./modules/ai");
const { MongoRateStore } = require("./lib/rate-store");
function createApp(config = loadConfig()) {
  const app = express();
  app.locals.config = config;
  app.disable("x-powered-by");
  app.disable("etag");
  app.set("trust proxy", config.TRUST_PROXY);
  app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.set("X-Request-Id", req.id);
    next();
  });
  app.use((req, res, next) => {
    if (
      config.secure &&
      !req.secure &&
      !["/health/live", "/health/ready"].includes(req.path)
    )
      return next(new HttpError(426, "HTTPS is required."));
    next();
  });
  app.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
      frameguard: { action: "deny" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'"],
          connectSrc: [
            "'self'",
            ...config.origins,
            ...config.origins.map((o) => o.replace(/^http/, "ws")),
          ],
          mediaSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: config.secure ? [] : null,
        },
      },
    }),
  );
  app.use((req, res, next) => {
    res.set(
      "Permissions-Policy",
      "camera=(self), microphone=(self), geolocation=()",
    );
    res.set("Cache-Control", "private, no-store");
    next();
  });
  app.use(
    cors({
      origin: (origin, cb) =>
        cb(null, !origin || config.origins.includes(origin)),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    }),
  );
  app.use((req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.get("origin");
      if (!origin || !config.origins.includes(origin))
        return next(new HttpError(403, "Untrusted request origin."));
      if (req.get("sec-fetch-site") === "cross-site")
        return next(new HttpError(403, "Cross-site request denied."));
      if (req.get("content-type") && !req.is("application/json"))
        return next(new HttpError(415, "Use application/json."));
    }
    next();
  });
  app.use(compression());
  app.use(express.json({ limit: "256kb", strict: true }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    try {
      rejectOperators(req.body);
      rejectOperators(req.query);
      next();
    } catch (e) {
      next(e);
    }
  });
  app.get("/health/live", (req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", (req, res) =>
    res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
      status: mongoose.connection.readyState === 1 ? "ready" : "unavailable",
    }),
  );
  app.use(
    "/api",
    rateLimit({
      ...(config.secure
        ? { store: new MongoRateStore(config.JWT_REFRESH_SECRET, "api") }
        : {}),
      windowMs: 15 * 60000,
      limit: 300,
      handler: (_req, res) =>
        res
          .status(429)
          .json({
            success: false,
            message: "Too many requests. Try again later.",
          }),
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );
  app.use(
    [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/verify-email",
      "/api/auth/resend-verification",
    ],
    rateLimit({
      ...(config.secure
        ? { store: new MongoRateStore(config.JWT_REFRESH_SECRET, "auth") }
        : {}),
      windowMs: 15 * 60000,
      limit: 30,
      skipSuccessfulRequests: true,
      handler: (_req, res) =>
        res
          .status(429)
          .json({
            success: false,
            message: "Too many requests. Try again later.",
          }),
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );
  const auth = createAuth(config);
  app.locals.auth = auth;
  app.use("/api", (req, res, next) => {
    res.on("finish", () => {
      if (
        req.user &&
        !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
        res.statusCode < 400
      ) {
        require("./models")
          .Audit.create({
            actorId: req.user._id,
            action: req.method + ":" + (req.route?.path || "action"),
            targetId: req.params?.id,
          })
          .catch(() => process.stderr.write("Audit storage unavailable\n"));
      }
    });
    next();
  });
  app.use("/api/auth", auth.router);
  app.use("/api/ai", createAI(auth, config));
  app.use("/api", createLearning(auth));
  const path = require("node:path"),
    fs = require("node:fs");
  const webRoot = path.join(__dirname, "../client/dist");
  if (
    config.NODE_ENV !== "test" &&
    fs.existsSync(path.join(webRoot, "index.html"))
  ) {
    app.use((req, res, next) => {
      if (
        req.path.split("/").some((segment) => segment.startsWith(".")) ||
        req.path.startsWith("/uploads/")
      )
        return next(new HttpError(404, "Resource not found."));
      next();
    });
    app.use(
      express.static(webRoot, {
        dotfiles: "deny",
        index: false,
        maxAge: "1y",
        immutable: true,
      }),
    );
    app.get("/{*splat}", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/health/"))
        return next(new HttpError(404, "Resource not found."));
      res.set("Cache-Control", "no-store");
      res.sendFile(path.join(webRoot, "index.html"));
    });
  }
  app.use((req, res, next) => next(new HttpError(404, "Resource not found.")));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status =
      error instanceof HttpError
        ? error.status
        : error.type === "entity.too.large"
          ? 413
          : error instanceof SyntaxError ||
              error.name === "ValidationError" ||
              error.name === "CastError" ||
              error.name === "StrictModeError"
            ? 400
            : error.code === 11000
              ? 409
              : 500;
    const message =
      status === 500
        ? "The service could not complete this request."
        : status === 409
          ? "This record already exists."
          : error instanceof HttpError
            ? error.message
            : status === 413
              ? "Request is too large."
              : "Invalid request.";
    if (status === 500)
      process.stderr.write(
        JSON.stringify({
          level: "error",
          requestId: req.id,
          event: "request.failed",
        }) + "\n",
      );
    res.status(status).json({ success: false, message, requestId: req.id });
  });
  return app;
}
module.exports = { createApp };
