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

    const currentPublished = existingArticle.is_published;
    const newPublished = is_published || false;
    
    // Set published_at if publishing for the first time
    let publishedAt = existingArticle.published_at;
    if (!currentPublished && newPublished) {
      publishedAt = new Date();
    }

    const updateData = {
      title: title || existingArticle.title,
      content: content || existingArticle.content,
      featured_image: featured_image || existingArticle.featured_image,
      media_files: media_files ? JSON.stringify(media_files) : existingArticle.media_files,
      author: author || existingArticle.author,
      is_published: is_published !== undefined ? is_published : existingArticle.is_published,
      published_at: publishedAt,
      updated_at: new Date()
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
