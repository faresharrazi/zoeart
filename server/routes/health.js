const express = require("express");
const { testConnection, getDbStats } = require("../config/database");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running",
    version: "2.0",
    features: ["file_upload", "admin_endpoints", "debugging"],
    timestamp: new Date().toISOString(),
  });
});

// Database health check
router.get(
  "/db",
  asyncHandler(async (req, res) => {
    const isConnected = await testConnection();

    if (isConnected) {
      res.json({
        status: "OK",
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "ERROR",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  })
);

// Database statistics
router.get(
  "/db/stats",
  asyncHandler(async (req, res) => {
    const stats = await getDbStats();

    res.json({
      status: "OK",
      message: "Database statistics retrieved",
      stats,
      timestamp: new Date().toISOString(),
    });
  })
);

// System information
router.get("/system", (req, res) => {
  res.json({
    status: "OK",
    message: "System information",
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || "development",
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
