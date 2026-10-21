const express = require("express");
const { query, transaction } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Opening hours. The public site gets active rows only; admin requests get
// all rows so inactive days can be edited and re-enabled.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT * FROM working_hours
       ${req.isAdminRequest ? "" : "WHERE is_active = TRUE"}
       ORDER BY id`
    );
    res.json(result.rows);
  })
);

// Replace all opening hours (admin only)
router.put(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { workingHours } = req.body;

    if (!Array.isArray(workingHours)) {
      throw new ValidationError("Working hours must be an array");
    }
    for (const hour of workingHours) {
      if (!hour.day || !hour.time_frame) {
        throw new ValidationError(
          "Each working hour must have day and time_frame"
        );
      }
    }

    // All-or-nothing, so a failure can't leave the hours half-deleted
    const rows = await transaction(async (client) => {
      await client.query("DELETE FROM working_hours");
      for (const hour of workingHours) {
        await client.query(
          "INSERT INTO working_hours (day, time_frame, is_active) VALUES ($1, $2, $3)",
          [hour.day, hour.time_frame, hour.is_active !== false]
        );
      }
      const result = await client.query(
        "SELECT * FROM working_hours ORDER BY id"
      );
      return result.rows;
    });

    res.json(rows);
  })
);

// Update a single working hour (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { day, time_frame, is_active } = req.body;

    if (!day || !time_frame) {
      throw new ValidationError("Day and time_frame are required");
    }

    const result = await query(
      "UPDATE working_hours SET day = $1, time_frame = $2, is_active = $3 WHERE id = $4 RETURNING *",
      [day, time_frame, is_active !== false, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Working hour not found");
    }

    res.json(result.rows[0]);
  })
);

module.exports = router;
