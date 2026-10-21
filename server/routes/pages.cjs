const express = require("express");
const { query } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Contact details shown on the site (an empty field isn't shown), with the
// longest value each column holds
const CONTACT_FIELDS = { email: 100, phone: 20, instagram: 100, address: 300 };
const PUBLIC_CONTACT_COLUMNS =
  "id, email, phone, instagram, address, updated_at";

// Get all page content (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pages = await query("SELECT * FROM page_content");
    const contactInfo = await query(
      `SELECT ${PUBLIC_CONTACT_COLUMNS} FROM contact_info LIMIT 1`
    );

    const pageData = pages.rows.reduce((acc, page) => {
      try {
        acc[page.page_name] = {
          ...page,
          isVisible: Boolean(page.is_visible), // Convert integer to boolean
          content:
            typeof page.content === "string"
              ? JSON.parse(page.content || "{}")
              : page.content || {},
        };
      } catch (e) {
        console.error("Error parsing page content for", page.page_name, e);
        acc[page.page_name] = {
          ...page,
          isVisible: Boolean(page.is_visible), // Convert integer to boolean
          content: {},
        };
      }
      return acc;
    }, {});

    // Visible opening hours and partners travel with the page settings, so
    // the footer and contact page need no extra requests
    const openingHours = await query(
      `SELECT id, day, time_frame FROM working_hours
       WHERE is_active = TRUE ORDER BY sort_order, id`
    );
    const partners = await query(
      `SELECT id, name, logo_url, website_url FROM partners
       WHERE is_visible = TRUE ORDER BY sort_order, id`
    );

    const response = {
      partners: partners.rows,
      openingHours: openingHours.rows,
      pages: pageData,
      contactInfo: contactInfo.rows.length > 0 ? contactInfo.rows[0] : {},
    };

    res.json(response);
  })
);

// Get single page content (public)
router.get(
  "/:pageName",
  asyncHandler(async (req, res) => {
    const { pageName } = req.params;

    const page = await query(
      "SELECT * FROM page_content WHERE page_name = $1",
      [pageName]
    );

    if (page.rows.length === 0) {
      throw new NotFoundError("Page not found");
    }

    const pageData = page.rows[0];
    const transformedPage = {
      ...pageData,
      isVisible: Boolean(pageData.is_visible),
      content:
        typeof pageData.content === "string"
          ? JSON.parse(pageData.content || "{}")
          : pageData.content || {},
    };

    res.json(transformedPage);
  })
);

// Settings a page can store in its `content`, each with the values it accepts
const PAGE_SETTINGS = {
  // Seconds before the home page photos change
  slideSeconds: (value) =>
    typeof value === "number" && value >= 2 && value <= 30,
};

// Update page content (admin only)
router.put(
  "/:pageName",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { pageName } = req.params;
    const { content, is_visible, title, description } = req.body;

    // Only change what was sent: an editor that saves the title alone must
    // not wipe the page's content or visibility.
    const updateData = {};
    if (content !== undefined) {
      if (!content || typeof content !== "object" || Array.isArray(content)) {
        throw new ValidationError("Page settings must be an object");
      }
      for (const [key, value] of Object.entries(content)) {
        if (!PAGE_SETTINGS[key]?.(value)) {
          throw new ValidationError(`Invalid page setting: ${key}`);
        }
      }
      updateData.content = JSON.stringify(content);
    }
    if (is_visible !== undefined) updateData.is_visible = is_visible !== false;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("Nothing to update");
    }

    const result = await query(
      `UPDATE page_content 
     SET ${Object.keys(updateData)
       .map((key, index) =>
         // Settings are merged into the existing ones, not replaced
         key === "content"
           ? `content = COALESCE(content, '{}'::jsonb) || $${index + 1}::jsonb`
           : `${key} = $${index + 1}`
       )
       .join(", ")}
     WHERE page_name = $${Object.keys(updateData).length + 1}
     RETURNING *`,
      [...Object.values(updateData), pageName]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Page not found");
    }

    res.json(result.rows[0]);
  })
);

// Update contact info (admin only)
router.put(
  "/contact/info",
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Only the fields sent are changed
    const updateData = {};
    for (const [field, maxLength] of Object.entries(CONTACT_FIELDS)) {
      if (req.body[field] !== undefined) {
        updateData[field] = String(req.body[field] ?? "").trim();
        if (updateData[field].length > maxLength) {
          throw new ValidationError(
            `The ${field} can be at most ${maxLength} characters`
          );
        }
      }
    }
    updateData.updated_at = new Date().toISOString();

    // Check if contact info exists
    const existing = await query("SELECT id FROM contact_info LIMIT 1");

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE contact_info 
       SET ${Object.keys(updateData)
         .map((key, index) => `${key} = $${index + 1}`)
         .join(", ")}
       WHERE id = $${Object.keys(updateData).length + 1}
       RETURNING ${PUBLIC_CONTACT_COLUMNS}`,
        [...Object.values(updateData), existing.rows[0].id]
      );
    } else {
      // Create new
      result = await query(
        `INSERT INTO contact_info (${Object.keys(updateData).join(", ")})
       VALUES (${Object.keys(updateData)
         .map((_, index) => `$${index + 1}`)
         .join(", ")})
       RETURNING ${PUBLIC_CONTACT_COLUMNS}`,
        Object.values(updateData)
      );
    }

    res.json(result.rows[0]);
  })
);

// Get contact info (public)
router.get(
  "/contact/info",
  asyncHandler(async (req, res) => {
    const contactInfo = await query(
      `SELECT ${PUBLIC_CONTACT_COLUMNS} FROM contact_info LIMIT 1`
    );

    if (contactInfo.rows.length === 0) {
      return res.json({});
    }

    res.json(contactInfo.rows[0]);
  })
);

module.exports = router;
