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
    
    // In production, you can add specific domains here
    const allowedOrigins = [
      "https://zoeart.vercel.app",
      "https://www.zoeart.vercel.app",
      "https://aetherartspace.com",
      "https://www.aetherartspace.com"
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
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
    if (buf.length > 10 * 1024 * 1024) { // 10MB
      console.log(`Large payload received: ${buf.length} bytes`);
    }
  }
});

// URL encoded parsing with size limits
const urlEncodedParser = express.urlencoded({ 
  limit: "50mb", 
  extended: true 
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
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
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
    params: req.params
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
