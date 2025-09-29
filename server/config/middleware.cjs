const cors = require("cors");
const express = require("express");

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost in development
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // In production, allow specific domains and Vercel preview URLs
    const allowedOrigins = [
      "https://zoeart.vercel.app",
      "https://www.zoeart.vercel.app",
      "https://aetherartspace.com",
      "https://www.aetherartspace.com",
    ];

    // Check if it's an allowed origin
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview URLs (dynamic subdomains)
    // Pattern: https://zoeart-[hash]-[username].vercel.app
    const vercelPreviewPattern =
      /^https:\/\/zoeart-[a-zA-Z0-9]+-[a-zA-Z0-9-]+\.vercel\.app$/;
    if (vercelPreviewPattern.test(origin)) {
      console.log(`Allowing Vercel preview URL: ${origin}`);
      return callback(null, true);
    }

    // Allow any Vercel preview URL for this project
    // Pattern: https://[project-name]-[hash]-[username].vercel.app
    const vercelProjectPattern =
      /^https:\/\/[a-zA-Z0-9-]+-[a-zA-Z0-9]+-[a-zA-Z0-9-]+\.vercel\.app$/;
    if (vercelProjectPattern.test(origin)) {
      console.log(`Allowing Vercel project URL: ${origin}`);
      return callback(null, true);
    }

    // Allow additional origins from environment variable (comma-separated)
    const additionalOrigins = process.env.ALLOWED_ORIGINS;
    if (additionalOrigins) {
      const origins = additionalOrigins.split(",").map((o) => o.trim());
      if (origins.includes(origin)) {
        console.log(`Allowing additional origin: ${origin}`);
        return callback(null, true);
      }
    }

    console.log(`CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// JSON parsing with size limits
const jsonParser = express.json({
  limit: "50mb",
  verify: (req, res, buf) => {
    // Log large payloads for debugging
    if (buf.length > 10 * 1024 * 1024) {
      // 10MB
      console.log(`Large payload received: ${buf.length} bytes`);
    }
  },
});

// URL encoded parsing with size limits
const urlEncodedParser = express.urlencoded({
  limit: "50mb",
  extended: true,
});

// Request timeout middleware
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    // Set higher limits for specific routes
    if (req.path === "/api/upload") {
      req.setTimeout(timeout);
    }
    next();
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  console.error(`Error in ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next(err);
};

module.exports = {
  corsOptions,
  cors: cors(corsOptions),
  jsonParser,
  urlEncodedParser,
  requestTimeout,
  requestLogger,
  errorLogger,
};
