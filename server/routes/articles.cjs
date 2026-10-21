const express = require("express");
const { DatabaseService } = require("../services/database.cjs");
const { query } = require("../config/database.cjs");
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
    // Drafts are only listed for logged-in requests through /api/admin
    const { rows: articlesWithExhibitions } = await query(
      `SELECT a.*, e.title AS exhibition_title, e.slug AS exhibition_slug,
              e.start_date, e.end_date
       FROM articles a
       LEFT JOIN exhibitions e ON e.id = a.exhibition_id
       ${req.isAdminRequest ? "" : "WHERE a.is_published = TRUE"}
       ORDER BY ${req.isAdminRequest ? "a.created_at" : "a.published_at"} DESC`
    );

    res.json({
      success: true,
      data: articlesWithExhibitions,
    });
  })
);

// GET /api/articles/:id - Get specific article (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Find published article by ID
    const article = await DatabaseService.findOne("articles", {
      id: parseInt(id),
      is_published: true
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    // Get exhibition details
    const exhibition = await DatabaseService.findById("exhibitions", article.exhibition_id);
    
    const articleWithExhibition = {
      ...article,
      exhibition_title: exhibition?.title || null,
      exhibition_slug: exhibition?.slug || null,
      start_date: exhibition?.start_date || null,
      end_date: exhibition?.end_date || null,
      location: exhibition?.location || null,
      curator: exhibition?.curator || null,
    };

    res.json({
      success: true,
      data: articleWithExhibition,
    });
  })
);

// GET /api/articles/exhibition/:exhibitionId - Get article for specific exhibition (public)
router.get(
  "/exhibition/:exhibitionId",
  asyncHandler(async (req, res) => {
    const { exhibitionId } = req.params;
    
    // Find published article for this exhibition
    const article = await DatabaseService.findOne("articles", {
      exhibition_id: parseInt(exhibitionId),
      is_published: true
    });

    if (!article) {
      throw new NotFoundError("No article found for this exhibition");
    }

    // Get exhibition details
    const exhibition = await DatabaseService.findById("exhibitions", article.exhibition_id);
    
    const articleWithExhibition = {
      ...article,
      exhibition_title: exhibition?.title || null,
      exhibition_slug: exhibition?.slug || null,
      start_date: exhibition?.start_date || null,
      end_date: exhibition?.end_date || null,
      location: exhibition?.location || null,
      curator: exhibition?.curator || null,
    };

    res.json({
      success: true,
      data: articleWithExhibition,
    });
  })
);

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
      media_files: media_files || null,
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
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
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
    const existingArticle = await DatabaseService.findById("articles", id);
    if (!existingArticle) {
      throw new NotFoundError("Article not found");
    }

    // Set published_at when an article is published for the first time
    let publishedAt = existingArticle.published_at;
    if (!existingArticle.is_published && is_published === true && !publishedAt) {
      publishedAt = new Date();
    }

    // Fields left out keep their value; empty optional fields are cleared
    const updateData = {
      title: title || undefined,
      content: content || undefined,
      featured_image: featured_image === undefined ? undefined : featured_image || null,
      media_files: media_files === undefined ? undefined : media_files,
      author: author === undefined ? undefined : author || null,
      is_published,
      published_at: publishedAt,
    };

    const updatedArticle = await DatabaseService.update("articles", id, updateData);

    res.json({
      success: true,
      data: updatedArticle,
      message: "Article updated successfully",
    });
  })
);

// DELETE /api/admin/articles/:id - Delete article (admin)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await DatabaseService.findById("articles", id);
    if (!existingArticle) {
      throw new NotFoundError("Article not found");
    }

    await DatabaseService.delete("articles", id);

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  })
);

module.exports = router;
