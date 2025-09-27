const express = require("express");
const { query } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Get all page content (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.log("Fetching page content...");

    const pages = await query("SELECT * FROM page_content");
    const contactInfo = await query("SELECT * FROM contact_info");

    console.log("Pages found:", pages.rows.length);
    console.log("Contact info found:", contactInfo.rows.length);
    console.log(
      "Raw pages data:",
      pages.rows.map((p) => ({
        page_name: p.page_name,
        is_visible: p.is_visible,
        type: typeof p.is_visible,
      }))
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

    const response = {
      pages: pageData,
      contactInfo: contactInfo.rows.length > 0 ? contactInfo.rows[0] : {},
    };

    console.log("Page data keys:", Object.keys(pageData));
    console.log("Response structure:", {
      hasPages: !!response.pages,
      hasHome: !!response.pages.home,
      hasContactInfo: !!response.contactInfo,
      keys: Object.keys(response),
    });

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

// Update page content (admin only)
router.put(
  "/:pageName",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { pageName } = req.params;
    const { content, is_visible, title, description } = req.body;

    const updateData = {
      content: typeof content === "object" ? JSON.stringify(content) : content,
      is_visible: is_visible !== false,
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const result = await query(
      `UPDATE page_content 
     SET ${Object.keys(updateData)
       .map((key, index) => `${key} = $${index + 1}`)
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
    const { email, phone, instagram, address } = req.body;

    const updateData = {
      email: email || "",
      phone: phone || "",
      instagram: instagram || "",
      address: address || "",
      updated_at: new Date().toISOString(),
    };

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
       RETURNING *`,
        [...Object.values(updateData), existing.rows[0].id]
      );
    } else {
      // Create new
      result = await query(
        `INSERT INTO contact_info (${Object.keys(updateData).join(", ")})
       VALUES (${Object.keys(updateData)
         .map((_, index) => `$${index + 1}`)
         .join(", ")})
       RETURNING *`,
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
    const contactInfo = await query("SELECT * FROM contact_info LIMIT 1");

    if (contactInfo.rows.length === 0) {
      return res.json({});
    }

    res.json(contactInfo.rows[0]);
  })
);

// Admin contact info routes
// Update contact info (admin only) - alternative endpoint
router.put(
  "/contact-info",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { email, phone, instagram, address } = req.body;

    const updateData = {
      email: email || "",
      phone: phone || "",
      instagram: instagram || "",
      address: address || "",
      updated_at: new Date().toISOString(),
    };

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
       RETURNING *`,
        [...Object.values(updateData), existing.rows[0].id]
      );
    } else {
      // Create new
      result = await query(
        `INSERT INTO contact_info (${Object.keys(updateData).join(", ")})
       VALUES (${Object.keys(updateData)
         .map((_, index) => `$${index + 1}`)
         .join(", ")})
       RETURNING *`,
        Object.values(updateData)
      );
    }

    res.json(result.rows[0]);
  })
);

module.exports = router;
