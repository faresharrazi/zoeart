const express = require("express");
const { query, transaction } = require("../config/database.cjs");
const imageService = require("../services/imageService.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

// Partner logos shown in the footer ("Collaboration").
const router = express.Router();

const COLUMNS =
  "id, name, logo_url, website_url, sort_order, is_visible, created_at, updated_at";

// Only http(s) links are allowed as partner websites
const cleanWebsite = (url) => {
  const value = String(url || "").trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).href;
  } catch {
    throw new ValidationError("Website must be a valid web address");
  }
};

// List partners in display order. Hidden ones only for admin requests.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT ${COLUMNS} FROM partners
       ${req.isAdminRequest ? "" : "WHERE is_visible = TRUE"}
       ORDER BY sort_order, id`
    );
    res.json(rows);
  })
);

// Add a partner at the end of the list (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { name, logo_url, website_url, is_visible } = req.body;
    if (!name || !String(name).trim()) {
      throw new ValidationError("Name is required");
    }
    if (!logo_url) {
      throw new ValidationError("A logo is required");
    }

    const { rows } = await query(
      `INSERT INTO partners (name, logo_url, website_url, is_visible, sort_order)
       VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM partners))
       RETURNING ${COLUMNS}`,
      [
        String(name).trim(),
        logo_url,
        cleanWebsite(website_url),
        is_visible !== false,
      ]
    );
    res.status(201).json(rows[0]);
  })
);

// Reorder partners (admin only). Declared before /:id routes.
router.patch(
  "/reorder",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { ids } = req.body; // partner ids in their new order
    if (!Array.isArray(ids)) {
      throw new ValidationError("ids array is required");
    }
    await transaction(async (client) => {
      for (const [index, id] of ids.entries()) {
        await client.query(
          "UPDATE partners SET sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [id, index + 1]
        );
      }
    });
    res.json({ success: true });
  })
);

// Update a partner (admin only); fields left out keep their value
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { rows: existing } = await query(
      "SELECT * FROM partners WHERE id = $1",
      [req.params.id]
    );
    const before = existing[0];
    if (!before) {
      throw new NotFoundError("Partner not found");
    }

    const { name, logo_url, website_url, is_visible } = req.body;
    if (name !== undefined && !String(name).trim()) {
      throw new ValidationError("Name is required");
    }

    const { rows } = await query(
      `UPDATE partners
       SET name = $2, logo_url = $3, website_url = $4, is_visible = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [
        before.id,
        name !== undefined ? String(name).trim() : before.name,
        logo_url || before.logo_url,
        website_url !== undefined
          ? cleanWebsite(website_url)
          : before.website_url,
        is_visible !== undefined ? is_visible !== false : before.is_visible,
      ]
    );

    if (rows[0].logo_url !== before.logo_url) {
      await imageService.deleteUnusedImages([before.logo_url]);
    }
    res.json(rows[0]);
  })
);

// Delete a partner (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "DELETE FROM partners WHERE id = $1 RETURNING logo_url",
      [req.params.id]
    );
    if (!rows[0]) {
      throw new NotFoundError("Partner not found");
    }
    await imageService.deleteUnusedImages([rows[0].logo_url]);
    res.json({ success: true });
  })
);

module.exports = router;
