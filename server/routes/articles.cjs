const express = require("express");
const {
  DatabaseService,
} = require("../services/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();


// GET /api/articles - Get all published articles (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Check if this is an admin request
    const isAdminRequest = req.originalUrl.includes('/admin/');
    
    let whereClause = {};
    let orderBy = "created_at DESC";
    
    if (!isAdminRequest) {
      whereClause = { is_published: true };
      orderBy = "published_at DESC";
    }

    const articles = await DatabaseService.findAll(
      "articles",
      whereClause,
      orderBy
    );

    // Get exhibition details for each article
    const articlesWithExhibitions = await Promise.all(
      articles.map(async (article) => {
        let exhibition = null;
        if (article.exhibition_id) {
          exhibition = await DatabaseService.findById("exhibitions", article.exhibition_id);
        }
        
        return {
          ...article,
          exhibition_title: exhibition?.title || null,
          exhibition_slug: exhibition?.slug || null,
          start_date: exhibition?.start_date || null,
          end_date: exhibition?.end_date || null,
        };
      })
    );

    res.json({
      success: true,
      data: articlesWithExhibitions,
    });
  })
);

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

// POST /api/admin/articles - Create new article (admin)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
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
      throw new ValidationError("Exhibition ID, title, and content are required");
    }

    // Check if exhibition exists
    const exhibition = await DatabaseService.findById("exhibitions", exhibition_id);
    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    // Check if article already exists for this exhibition
    const existingArticle = await DatabaseService.findOne("articles", { exhibition_id });
    if (existingArticle) {
      throw new ValidationError("Article already exists for this exhibition");
    }

    const articleData = {
      exhibition_id: parseInt(exhibition_id),
      title,
      content,
      featured_image: featured_image || null,
      media_files: media_files ? JSON.stringify(media_files) : null,
      author: author || null,
      is_published: is_published || false,
      published_at: is_published ? new Date() : null
    };

    const newArticle = await DatabaseService.create("articles", articleData);

    res.status(201).json({
      success: true,
      data: newArticle,
      message: "Article created successfully",
    });
  })
);

// PUT /api/admin/articles/:id - Update article (admin)
router.put("/:id", authenticateToken, async (req, res) => {
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
router.delete("/:id", authenticateToken, async (req, res) => {
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
