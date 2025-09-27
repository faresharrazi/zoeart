const express = require("express");
const { query, executeQuery } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");

// Simple async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();

// Get all about blocks (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await query(
      "SELECT * FROM about_blocks ORDER BY sort_order ASC, id ASC"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

// Get visible about blocks only (public)
router.get(
  "/visible",
  asyncHandler(async (req, res) => {
    const result = await query(
      "SELECT * FROM about_blocks WHERE is_visible = true ORDER BY sort_order ASC, id ASC"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

// Get single about block by ID (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query("SELECT * FROM about_blocks WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "About block not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Create new about block (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { title, content, is_visible = true, sort_order = 0 } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "title and content are required",
      });
    }

    // Generate block_id automatically
    const existingBlocks = await query(
      "SELECT block_id FROM about_blocks ORDER BY id"
    );
    let blockId = "block1";
    let counter = 1;
    while (existingBlocks.rows.some((row) => row.block_id === blockId)) {
      counter++;
      blockId = `block${counter}`;
    }

    const result = await query(
      `INSERT INTO about_blocks (block_id, title, content, is_visible, sort_order) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [blockId, title, content, is_visible, sort_order]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "About block created successfully",
    });
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
      return res.status(404).json({
        success: false,
        message: "About block not found",
      });
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
    const { is_visible } = req.body;

    const result = await query(
      `UPDATE about_blocks 
     SET is_visible = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 
     RETURNING *`,
      [id, is_visible]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "About block not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `About block ${is_visible ? "shown" : "hidden"} successfully`,
    });
  })
);

// Delete about block (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM about_blocks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "About block not found",
      });
    }

    // Renumber remaining blocks to maintain sequential order
    const remainingBlocks = await query(
      "SELECT id FROM about_blocks ORDER BY sort_order ASC, id ASC"
    );

    for (let i = 0; i < remainingBlocks.rows.length; i++) {
      await query(
        "UPDATE about_blocks SET sort_order = $1 WHERE id = $2",
        [i + 1, remainingBlocks.rows[i].id]
      );
    }

    res.json({
      success: true,
      message: "About block deleted successfully",
    });
  })
);

// Reorder blocks (admin only)
router.patch(
  "/reorder",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { blocks } = req.body; // Array of {id, sort_order}

    if (!Array.isArray(blocks)) {
      return res.status(400).json({
        success: false,
        message: "blocks array is required",
      });
    }

    // Update sort order for each block
    for (const block of blocks) {
      await query(
        "UPDATE about_blocks SET sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [block.id, block.sort_order]
      );
    }

    res.json({
      success: true,
      message: "Blocks reordered successfully",
    });
  })
);

module.exports = router;
