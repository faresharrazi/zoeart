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
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Upload image (admin only). Cloudinary when configured, Postgres otherwise.
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  handleUploadError,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    let result;
    try {
      result = await imageService.uploadImage(req.file, {
        category: getFileCategory(req),
        uploadedBy: req.user.id,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new ValidationError(`Image upload failed: ${error.message}`);
    }

    res.json({
      success: true,
      file: {
        id: result.id || result.public_id,
        url: result.url,
        originalName: req.file.originalname,
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        source: result.source,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  })
);

module.exports = router;
