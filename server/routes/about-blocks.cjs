const express = require("express");
const { query, transaction } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// About page blocks in display order. Hidden blocks are only included for
// admin requests.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT * FROM about_blocks
       ${req.isAdminRequest ? "" : "WHERE is_visible = TRUE"}
       ORDER BY sort_order ASC, id ASC`
    );

    res.json({ success: true, data: result.rows });
  })
);

// Create new about block (admin only), added at the end
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { title, content, is_visible = true } = req.body;

    if (!title || !content) {
      throw new ValidationError("title and content are required");
    }

    const result = await query(
      `INSERT INTO about_blocks (block_id, title, content, is_visible, sort_order)
       VALUES (
         'block-' || substr(md5(random()::text), 1, 12), $1, $2, $3,
         (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM about_blocks)
       )
       RETURNING *`,
      [title, content, is_visible !== false]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "About block created successfully",
    });
  })
);

// Reorder blocks (admin only). Declared before /:id routes.
router.patch(
  "/reorder",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { blocks } = req.body; // Array of {id, sort_order}

    if (!Array.isArray(blocks)) {
      throw new ValidationError("blocks array is required");
    }

    await transaction(async (client) => {
      for (const block of blocks) {
        await client.query(
          "UPDATE about_blocks SET sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [block.id, block.sort_order]
        );
      }
    });

    res.json({ success: true, message: "Blocks reordered successfully" });
  })
);

// Update about block (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, is_visible, sort_order } = req.body;

    const result = await query(
      `UPDATE about_blocks
       SET title = COALESCE($2, title),
           content = COALESCE($3, content),
           is_visible = COALESCE($4, is_visible),
           sort_order = COALESCE($5, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, title, content, is_visible, sort_order]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("About block not found");
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: "About block updated successfully",
    });
  })
);

// Toggle block visibility (admin only)
router.patch(
  "/:id/visibility",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isVisible = req.body.is_visible !== false;

    const result = await query(
      "UPDATE about_blocks SET is_visible = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id, isVisible]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("About block not found");
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `About block ${isVisible ? "shown" : "hidden"} successfully`,
    });
  })
);

// Delete about block (admin only) and renumber the rest
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const deleted = await transaction(async (client) => {
      const result = await client.query(
        "DELETE FROM about_blocks WHERE id = $1 RETURNING id",
        [req.params.id]
      );
      if (result.rows.length > 0) {
        await client.query(
          `UPDATE about_blocks b SET sort_order = r.n
           FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order, id) AS n FROM about_blocks) r
           WHERE b.id = r.id`
        );
      }
      return result.rows[0];
    });

    if (!deleted) {
      throw new NotFoundError("About block not found");
    }

    res.json({ success: true, message: "About block deleted successfully" });
  })
);

module.exports = router;
