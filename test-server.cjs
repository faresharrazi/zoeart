const express = require("express");
const { testConnection } = require("./server/config/database.cjs");

const app = express();
const PORT = 3002;

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Test server running" });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      status: isConnected ? "OK" : "ERROR",
      message: isConnected ? "Database connected" : "Database not connected",
      connected: isConnected,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database test failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
