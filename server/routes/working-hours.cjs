const express = require("express");
const { query, transaction } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
} = require("../middleware/errorHandler.cjs");

// Opening hours: a list of rows ("Monday – Friday" / "10:00 – 18:00") in the
// order the admin set. The site shows the rows switched on; admin requests
// get every row.
const router = express.Router();

const COLUMNS = "id, day, time_frame, is_active, sort_order";

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT ${COLUMNS} FROM working_hours
       ${req.isAdminRequest ? "" : "WHERE is_active = TRUE"}
       ORDER BY sort_order, id`
    );
    res.json(result.rows);
  })
);

// Replace the whole list (admin only), in the order given
router.put(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { workingHours } = req.body;

    if (!Array.isArray(workingHours)) {
      throw new ValidationError("Opening hours must be a list");
    }
    const rows = workingHours.map((row) => ({
      day: String(row.day ?? "").trim(),
      time_frame: String(row.time_frame ?? "").trim(),
      is_active: row.is_active !== false,
    }));
    for (const row of rows) {
      if (!row.day || !row.time_frame) {
        throw new ValidationError("Each row needs a day and its hours");
      }
      if (row.day.length > 60 || row.time_frame.length > 120) {
        throw new ValidationError("A day or hours entry is too long");
      }
    }

    // All-or-nothing, so a failure can't leave the hours half-deleted
    const saved = await transaction(async (client) => {
      await client.query("DELETE FROM working_hours");
      for (const [index, row] of rows.entries()) {
        await client.query(
          "INSERT INTO working_hours (day, time_frame, is_active, sort_order) VALUES ($1, $2, $3, $4)",
          [row.day, row.time_frame, row.is_active, index + 1]
        );
      }
      const result = await client.query(
        `SELECT ${COLUMNS} FROM working_hours ORDER BY sort_order, id`
      );
      return result.rows;
    });

    res.json(saved);
  })
);

module.exports = router;
