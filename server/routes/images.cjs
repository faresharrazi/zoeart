const express = require("express");
const imageService = require("../services/imageService.cjs");
const { uploadOptions } = require("../config/cloudinary.cjs");
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
    console.log("Environment check:", {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
        ? "Set"
        : "Not set",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
        ? "Set"
        : "Not set",
    });

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
    let selectedUploadOptions = {};
    switch (category) {
      case "exhibition":
        selectedUploadOptions = uploadOptions.exhibition;
        break;
      case "artwork":
        selectedUploadOptions = uploadOptions.artwork;
        break;
      case "artist":
      case "artist_profile":
        selectedUploadOptions = uploadOptions.artist;
        break;
      case "hero":
        selectedUploadOptions = uploadOptions.hero;
        break;
      default:
        selectedUploadOptions = uploadOptions.default;
    }

    selectedUploadOptions.category = category;
    selectedUploadOptions.uploadedBy = uploadedBy;

    console.log("Upload options:", selectedUploadOptions);

    let result;
    try {
      result = await imageService.uploadImage(req.file, selectedUploadOptions);
      console.log("Image upload result:", result);
      console.log("Result success:", result.success);
      console.log("Result error:", result.error);

      if (!result.success) {
        console.log("Upload failed, throwing ValidationError");
        throw new ValidationError(result.error || "Image upload failed");
      }
    } catch (error) {
      console.error("ImageService upload error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new ValidationError(`Image upload failed: ${error.message}`);
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
        format: result.format,
      },
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
    let selectedUploadOptions = {};
    switch (category) {
      case "exhibition":
        selectedUploadOptions = uploadOptions.exhibition;
        break;
      case "artwork":
        selectedUploadOptions = uploadOptions.artwork;
        break;
      case "artist":
      case "artist_profile":
        selectedUploadOptions = uploadOptions.artist;
        break;
      case "hero":
        selectedUploadOptions = uploadOptions.hero;
        break;
      default:
        selectedUploadOptions = uploadOptions.default;
    }

    selectedUploadOptions.category = category;
    selectedUploadOptions.uploadedBy = uploadedBy;

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
            format: result.format,
          });
        } else {
          errors.push({
            filename: file.originalname,
            error: result.error,
          });
        }
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    res.json({
      success: errors.length === 0,
      files: results,
      errors: errors,
      totalUploaded: results.length,
      totalErrors: errors.length,
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
      optimized: false,
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
      message: "Image deletion not yet implemented",
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

    const result = await imageService.migrateToCloudinary(
      imageData,
      uploadOptions
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Image migrated successfully",
        cloudinaryUrl: result.cloudinaryUrl,
        publicId: result.publicId,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  })
);

module.exports = router;
