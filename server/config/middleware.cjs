const cors = require("cors");
const express = require("express");

// CORS configuration. The site calls its own API from the same origin, so
// cross-origin access is only needed for the production domains and any
// extra origins listed in ALLOWED_ORIGINS.
const ALLOWED_ORIGINS = [
  "https://aetherartspace.com",
  "https://www.aetherartspace.com",
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

const isAllowedOrigin = (origin, req) => {
  // Same-origin requests (production, Vercel previews, local proxy)
  if (origin === `https://${req.headers.host}`) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return (
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/localhost(:\d+)?$/.test(origin)
  );
};

const corsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;
  callback(null, {
    origin: !origin || isAllowedOrigin(origin, req),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
};

// Body parsers with size limits
const jsonParser = express.json({ limit: "4mb" });
const urlEncodedParser = express.urlencoded({ limit: "4mb", extended: true });

module.exports = {
  cors: cors(corsOptionsDelegate),
  jsonParser,
  urlEncodedParser,
};
