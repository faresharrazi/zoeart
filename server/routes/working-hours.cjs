const express = require("express");
const { query } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Get all working hours (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.log("Fetching working hours...");

    try {
      const result = await query(
        "SELECT * FROM working_hours WHERE is_active = true ORDER BY id"
      );

      console.log("Working hours found:", result.rows.length);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching working hours:", error);
      throw error;
    }
  })
);

// Get all working hours (admin only)
router.get(
  "/admin",
  authenticateToken,
  asyncHandler(async (req, res) => {
    console.log("Fetching all working hours for admin...");

    try {
      const result = await query("SELECT * FROM working_hours ORDER BY id");

      console.log("All working hours found:", result.rows.length);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching admin working hours:", error);
      throw error;
    }
  })
);

// Update working hours (admin only)
router.put(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { workingHours } = req.body;

    if (!Array.isArray(workingHours)) {
      throw new ValidationError("Working hours must be an array");
    }

    console.log("Updating working hours:", workingHours);

    try {
      // Clear existing working hours
      console.log("Clearing existing working hours...");
      await query("DELETE FROM working_hours");

      // Insert new working hours
      console.log("Inserting new working hours...");
      for (const hour of workingHours) {
        if (!hour.day || !hour.time_frame) {
          throw new ValidationError(
            "Each working hour must have day and time_frame"
          );
        }

        console.log(`Inserting: ${hour.day} - ${hour.time_frame} (active: ${hour.is_active})`);
        await query(
          "INSERT INTO working_hours (day, time_frame, is_active) VALUES ($1, $2, $3)",
          [hour.day, hour.time_frame, hour.is_active !== false]
        );
      }

      // Return updated working hours
      console.log("Fetching updated working hours...");
      const result = await query("SELECT * FROM working_hours ORDER BY id");

      console.log("Successfully updated working hours:", result.rows.length);
      res.json(result.rows);
    } catch (error) {
      console.error("Error updating working hours:", error);
      throw error;
    }
  })
);

// Update single working hour (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { day, time_frame, is_active } = req.body;

    if (!day || !time_frame) {
      throw new ValidationError("Day and time_frame are required");
    }

    console.log(`Updating working hour ${id}:`, { day, time_frame, is_active });

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
