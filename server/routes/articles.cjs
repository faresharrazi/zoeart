const express = require("express");
const { query } = require("../services/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");

const router = express.Router();

// GET /api/articles - Get all published articles (public)
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        a.*,
        e.title as exhibition_title,
        e.slug as exhibition_slug,
        e.start_date,
        e.end_date
      FROM articles a
      LEFT JOIN exhibitions e ON a.exhibition_id = e.id
      WHERE a.is_published = true
      ORDER BY a.published_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
    });
  }
});

// GET /api/articles/:id - Get specific article (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        a.*,
        e.title as exhibition_title,
        e.slug as exhibition_slug,
        e.start_date,
        e.end_date,
        e.location,
        e.curator
      FROM articles a
      LEFT JOIN exhibitions e ON a.exhibition_id = e.id
      WHERE a.id = $1 AND a.is_published = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
    });
  }
});

// GET /api/articles/exhibition/:exhibitionId - Get article for specific exhibition (public)
router.get("/exhibition/:exhibitionId", async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    
    const result = await query(`
      SELECT 
        a.*,
        e.title as exhibition_title,
        e.slug as exhibition_slug,
        e.start_date,
        e.end_date,
        e.location,
        e.curator
      FROM articles a
      LEFT JOIN exhibitions e ON a.exhibition_id = e.id
      WHERE a.exhibition_id = $1 AND a.is_published = true
    `, [exhibitionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No article found for this exhibition",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching exhibition article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exhibition article",
    });
  }
});

// Admin routes (require authentication)

// GET /api/admin/articles - Get all articles (admin)
router.get("/admin", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching admin articles...");
    
    const result = await query(`
      SELECT 
        a.*,
        e.title as exhibition_title,
        e.slug as exhibition_slug
      FROM articles a
      LEFT JOIN exhibitions e ON a.exhibition_id = e.id
      ORDER BY a.created_at DESC
    `);

    console.log("Articles query successful, found:", result.rows.length, "articles");
    
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching admin articles:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message
    });
  }
});

// POST /api/admin/articles - Create new article (admin)
router.post("/admin", authenticateToken, async (req, res) => {
  try {
    const {
      exhibition_id,
      title,
      content,
      featured_image,
      media_files,
      author,
      is_published
    } = req.body;

    // Validate required fields
    if (!exhibition_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Exhibition ID, title, and content are required",
      });
    }

    // Check if exhibition exists
    const exhibitionCheck = await query(
      "SELECT id FROM exhibitions WHERE id = $1",
      [exhibition_id]
    );

    if (exhibitionCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exhibition not found",
      });
    }

    // Check if article already exists for this exhibition
    const existingArticle = await query(
      "SELECT id FROM articles WHERE exhibition_id = $1",
      [exhibition_id]
    );

    if (existingArticle.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Article already exists for this exhibition",
      });
    }

    const result = await query(`
      INSERT INTO articles (
        exhibition_id, title, content, featured_image, 
        media_files, author, is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      exhibition_id,
      title,
      content,
      featured_image || null,
      media_files ? JSON.stringify(media_files) : null,
      author || null,
      is_published || false,
      is_published ? new Date() : null
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Article created successfully",
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create article",
    });
  }
});

// PUT /api/admin/articles/:id - Update article (admin)
router.put("/admin/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      featured_image,
      media_files,
      author,
      is_published
    } = req.body;

    // Check if article exists
    const existingArticle = await query(
      "SELECT id, is_published FROM articles WHERE id = $1",
      [id]
    );

    if (existingArticle.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const currentPublished = existingArticle.rows[0].is_published;
    const newPublished = is_published || false;
    
    // Set published_at if publishing for the first time
    let publishedAt = null;
    if (!currentPublished && newPublished) {
      publishedAt = new Date();
    }

    const result = await query(`
      UPDATE articles SET
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        featured_image = COALESCE($4, featured_image),
        media_files = COALESCE($5, media_files),
        author = COALESCE($6, author),
        is_published = COALESCE($7, is_published),
        published_at = COALESCE($8, published_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id,
      title,
      content,
      featured_image,
      media_files ? JSON.stringify(media_files) : null,
      author,
      is_published,
      publishedAt
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: "Article updated successfully",
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update article",
    });
  }
});

// DELETE /api/admin/articles/:id - Delete article (admin)
router.delete("/admin/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM articles WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete article",
    });
  }
});

module.exports = router;
