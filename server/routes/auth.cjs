const express = require("express");
const bcrypt = require("bcrypt");
const { query } = require("../config/database.cjs");
const { generateToken, authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Login endpoint
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError("Username and password are required");
    }

    console.log("Login attempt:", { username, password: "provided" });
    console.log("Request headers:", req.headers);
    console.log("Request host:", req.get('host'));
    console.log("Request origin:", req.get('origin'));

    // Check environment variables
    console.log("Environment variables check:");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
    console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "Set" : "Not set");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");

    try {
      // Get user from database
      const users = await query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      console.log("Found users:", users.rows.length);

      if (users.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = users.rows[0];

      // Test database connection
      console.log("Testing database connection...");
      console.log(
        "DATABASE_URL:",
        process.env.DATABASE_URL ? "Set" : "Not set"
      );
      console.log(
        "POSTGRES_URL:",
        process.env.POSTGRES_URL ? "Set" : "Not set"
      );

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role || "admin",
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role || "admin",
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ 
        error: "Login failed",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })
);

// Verify token endpoint
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Logout endpoint (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Get current user info
router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await query(
      "SELECT id, username, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: user.rows[0],
    });
  })
);

// Change password
router.post(
  "/change-password",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError(
        "Current password and new password are required"
      );
    }

    if (newPassword.length < 6) {
      throw new ValidationError(
        "New password must be at least 6 characters long"
      );
    }

    // Get current user
    const user = await query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.rows[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newPasswordHash,
      req.user.id,
    ]);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  })
);

// Refresh token endpoint
router.post(
  "/refresh",
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Generate new token with same user data
    const newToken = generateToken({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });

    res.json({
      success: true,
      token: newToken,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      },
    });
  })
);

module.exports = router;
