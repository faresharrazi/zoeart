const express = require("express");
const { query } = require("../config/database.cjs");
const { authenticateToken, requireAdmin } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} = require("../middleware/errorHandler.cjs");
const bcrypt = require("bcrypt");

const router = express.Router();

const MIN_PASSWORD_LENGTH = 10;
const ROLES = ["admin", "editor"];

// Admins can manage everyone; other users only themselves.
const requireSelfOrAdmin = (req, res, next) => {
  if (req.user.role === "admin" || String(req.user.id) === req.params.id) {
    return next();
  }
  next(new ForbiddenError("You can only manage your own account"));
};

// Get all users (admin only)
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const users =
      req.user.role === "admin"
        ? await query(
            "SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC"
          )
        : await query(
            "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1",
            [req.user.id]
          );

    res.json(users.rows);
  })
);

// Get single user (admin only)
router.get(
  "/:id",
  authenticateToken,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await query(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      throw new NotFoundError("User not found");
    }

    res.json(user.rows[0]);
  })
);

// Update user (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, password, currentPassword } = req.body;

    if (!username || !email) {
      throw new ValidationError("Username and email are required");
    }

    // Get current user
    const currentUser = await query("SELECT * FROM users WHERE id = $1", [id]);

    if (currentUser.rows.length === 0) {
      throw new NotFoundError("User not found");
    }

    const user = currentUser.rows[0];

    // If password is being changed, verify current password
    if (password) {
      if (!currentPassword) {
        throw new ValidationError(
          "Current password is required when changing password"
        );
      }

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        throw new ValidationError("Current password is incorrect");
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ValidationError(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
        );
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(password, saltRounds);

      // Update with new password
      await query(
        "UPDATE users SET username = $1, email = $2, password_hash = $3, updated_at = NOW() WHERE id = $4",
        [username, email, newPasswordHash, id]
      );
    } else {
      // Update without changing password
      await query(
        "UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE id = $3",
        [username, email, id]
      );
    }

    // Get updated user
    const updatedUser = await query(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser.rows[0],
    });
  })
);

// Create new user (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { username, email, password, role = "admin" } = req.body;

    if (!username || !email || !password) {
      throw new ValidationError("Username, email, and password are required");
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    }

    if (!ROLES.includes(role)) {
      throw new ValidationError(`Role must be one of: ${ROLES.join(", ")}`);
    }

    // Check if username or email already exists
    const existing = await query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      throw new ValidationError("Username or email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await query(
      "INSERT INTO users (username, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, username, email, role, created_at, updated_at",
      [username, email, passwordHash, role]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser.rows[0],
    });
  })
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Admins can't delete themselves, so at least one admin always remains.
    if (String(req.user.id) === id) {
      throw new ValidationError("You cannot delete your own account");
    }

    // Check if user exists
    const user = await query("SELECT id FROM users WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      throw new NotFoundError("User not found");
    }

    await query("DELETE FROM users WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  })
);

module.exports = router;
