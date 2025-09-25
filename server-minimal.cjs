const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error("Database connection string not found");
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Database query helper
async function query(sql, params = []) {
  try {
    const dbPool = getPool();
    const result = await dbPool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await query("SELECT NOW() as current_time, version() as postgres_version");
    res.json({
      status: "OK",
      message: "Database connected successfully",
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user in database
    const users = await query(
      "SELECT id, username, email, password_hash, role FROM users WHERE username = $1",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Test users endpoint
app.get("/api/test-users", async (req, res) => {
  try {
    const users = await query("SELECT id, username, email, role FROM users");
    res.json({
      status: "OK",
      message: "Users table check",
      users: users
    });
  } catch (error) {
    console.error("Users check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Users check failed",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal API Server running on port ${PORT}`);
});

module.exports = app;
