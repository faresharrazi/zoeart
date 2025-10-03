const express = require("express");
const imageService = require("../services/imageService.cjs");
const {
  upload,
  handleUploadError,
  getFileCategory,
} = require("../config/multer.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Upload image (admin only) - New Cloudinary-enabled route
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  handleUploadError,
  asyncHandler(async (req, res) => {
    console.log("=== IMAGE UPLOAD (Cloudinary-enabled) ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? "File present" : "No file");

    if (!req.file) {
      console.log("No file uploaded");
      throw new ValidationError("No file uploaded");
    }

    const category = getFileCategory(req);
    const uploadedBy = req.user?.id || null;

    console.log("File details:", {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category: category,
    });

    // Determine upload options based on category
    let uploadOptions = {};
    switch (category) {
      case 'exhibition':
        uploadOptions = imageService.uploadOptions.exhibition;
        break;
      case 'artwork':
        uploadOptions = imageService.uploadOptions.artwork;
        break;
      case 'artist':
        uploadOptions = imageService.uploadOptions.artist;
        break;
      case 'hero':
        uploadOptions = imageService.uploadOptions.hero;
        break;
      default:
        uploadOptions = imageService.uploadOptions.default;
    }

    uploadOptions.category = category;
    uploadOptions.uploadedBy = uploadedBy;

    const result = await imageService.uploadImage(req.file, uploadOptions);
    console.log("Image upload result:", result);

    if (!result.success) {
      throw new ValidationError(result.error || "Image upload failed");
    }

    res.json({
      success: true,
      file: {
        id: result.id || result.public_id,
        url: result.url,
        originalName: result.originalName || req.file.originalname,
        filename: result.filename || req.file.originalname,
        fileSize: result.fileSize || req.file.size,
        mimeType: result.mimeType || req.file.mimetype,
        source: result.source,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  })
);

// Upload multiple images (admin only)
router.post(
  "/upload-multiple",
  authenticateToken,
  upload.array("files", 10), // Max 10 files
  handleUploadError,
  asyncHandler(async (req, res) => {
    console.log("=== MULTIPLE IMAGE UPLOAD ===");
    console.log("Files count:", req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      throw new ValidationError("No files uploaded");
    }

    const category = getFileCategory(req);
    const uploadedBy = req.user?.id || null;

    // Determine upload options based on category
    let uploadOptions = {};
    switch (category) {
      case 'exhibition':
        uploadOptions = imageService.uploadOptions.exhibition;
        break;
      case 'artwork':
        uploadOptions = imageService.uploadOptions.artwork;
        break;
      case 'artist':
        uploadOptions = imageService.uploadOptions.artist;
        break;
      case 'hero':
        uploadOptions = imageService.uploadOptions.hero;
        break;
      default:
        uploadOptions = imageService.uploadOptions.default;
    }

    uploadOptions.category = category;
    uploadOptions.uploadedBy = uploadedBy;

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const result = await imageService.uploadImage(file, uploadOptions);
        if (result.success) {
          results.push({
            id: result.id || result.public_id,
            url: result.url,
            originalName: result.originalName || file.originalname,
            filename: result.filename || file.originalname,
            fileSize: result.fileSize || file.size,
            mimeType: result.mimeType || file.mimetype,
            source: result.source,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          });
        } else {
          errors.push({
            filename: file.originalname,
            error: result.error
          });
        }
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: errors.length === 0,
      files: results,
      errors: errors,
      totalUploaded: results.length,
      totalErrors: errors.length
    });
  })
);

// Get optimized image URL
router.get(
  "/optimized/:imageId",
  asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const { width, height, crop, quality, format } = req.query;

    // This would need to be implemented based on how you store image references
    // For now, return the original URL
    res.json({
      url: `/api/images/${imageId}`,
      optimized: false
    });
  })
);

// Delete image (admin only)
router.delete(
  "/:imageId",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    
    // This would need to be implemented based on how you store image references
    // For now, return success
    res.json({
      success: true,
      message: "Image deletion not yet implemented"
    });
  })
);

// Migrate image to Cloudinary (admin only)
router.post(
  "/migrate/:imageId",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const { category } = req.body;

    const imageData = { id: imageId };
    const uploadOptions = category ? imageService.uploadOptions[category] : {};

    const result = await imageService.migrateToCloudinary(imageData, uploadOptions);

    if (result.success) {
      res.json({
        success: true,
        message: "Image migrated successfully",
        cloudinaryUrl: result.cloudinaryUrl,
        publicId: result.publicId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  })
);

module.exports = router;
