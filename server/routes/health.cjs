const express = require("express");
const { testConnection } = require("../config/database.cjs");

const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Database health check
router.get("/db", async (req, res) => {
  const isConnected = await testConnection();
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "OK" : "ERROR",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
