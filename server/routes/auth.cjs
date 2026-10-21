const express = require("express");
const bcrypt = require("bcrypt");
const { query } = require("../config/database.cjs");
const { generateToken, authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Best-effort brute-force protection: at most MAX_ATTEMPTS failed logins per
// IP and username within the window. Kept in memory, so it resets when a
// serverless instance is recycled, but it still slows down guessing.
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map();

const attemptKey = (req, username) =>
  `${req.headers["x-forwarded-for"] || req.ip}|${String(username).toLowerCase()}`;

const isLockedOut = (key) => {
  const entry = failedAttempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > ATTEMPT_WINDOW_MS) {
    failedAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
};

const recordFailure = (key) => {
  const entry = failedAttempts.get(key);
  if (!entry || Date.now() - entry.firstAt > ATTEMPT_WINDOW_MS) {
    failedAttempts.set(key, { count: 1, firstAt: Date.now() });
  } else {
    entry.count++;
  }
};

// Compared against when the username doesn't exist, so both cases take the
// same time and usernames can't be discovered by timing.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// Login endpoint
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError("Username and password are required");
    }

    const key = attemptKey(req, username);
    if (isLockedOut(key)) {
      return res
        .status(429)
        .json({ error: "Too many failed attempts. Try again in 15 minutes." });
    }

    const users = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = users.rows[0];

    const isValidPassword = await bcrypt.compare(
      String(password),
      user ? user.password_hash : DUMMY_HASH
    );

    if (!user || !isValidPassword) {
      recordFailure(key);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    failedAttempts.delete(key);

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

    if (newPassword.length < 10) {
      throw new ValidationError(
        "New password must be at least 10 characters long"
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
    const saltRounds = 12;
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
