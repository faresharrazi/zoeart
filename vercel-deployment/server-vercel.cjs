const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Vercel Postgres connection (will be configured via environment variables)
let db;

// Initialize database connection
async function initDB() {
  try {
    // For Vercel Postgres, we'll use the connection string from environment
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (connectionString) {
      // Use Vercel Postgres
      const { Pool } = require('pg');
      db = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
      });
      console.log("Connected to Vercel Postgres");
    } else {
      // Fallback to MySQL for local development
      db = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "aether_art_space",
      });
      console.log("Connected to MySQL");
    }
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

// Initialize database on startup
initDB();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Admin login endpoint
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    // Query admin user
    let user;
    if (db.query) {
      // PostgreSQL (Vercel)
      const result = await db.query(
        "SELECT * FROM admin_users WHERE username = $1",
        [username]
      );
      user = result.rows[0];
    } else {
      // MySQL fallback
      const [rows] = await db.execute(
        "SELECT * FROM admin_users WHERE username = ?",
        [username]
      );
      user = rows[0];
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Serve static files
app.get("*", (req, res) => {
  // If it's an API route, let it pass through
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  // Serve the React app
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
