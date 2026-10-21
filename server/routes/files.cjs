const express = require("express");
const FileService = require("../services/fileService.cjs");
const imageService = require("../services/imageService.cjs");
const {
  upload,
  handleUploadError,
  getFileCategory,
  ALLOWED_IMAGE_TYPES,
} = require("../config/multer.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

router.param("id", (req, res, next, id) => {
  next(/^\d+$/.test(id) ? undefined : new NotFoundError("File not found"));
});

// Upload an image (admin only). Goes to Cloudinary when configured.
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  handleUploadError,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const result = await imageService.uploadImage(req.file, {
      category: getFileCategory(req),
      uploadedBy: req.user.id,
    });

    res.json({ success: true, file: { id: result.id, url: result.url } });
  })
);

// Serve a file stored in Postgres (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const file = await FileService.getFileById(req.params.id);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Only known image types are shown inline; anything else (e.g. an SVG
    // uploaded before SVGs were blocked) is downloaded and can't run scripts.
    const isSafeImage = ALLOWED_IMAGE_TYPES.includes(file.mime_type);
    const safeName = String(file.original_name).replace(/[^\w.\- ]/g, "_");
    res.setHeader(
      "Content-Type",
      isSafeImage ? file.mime_type : "application/octet-stream"
    );
    res.setHeader("Content-Length", file.file_size);
    res.setHeader(
      "Content-Disposition",
      `${isSafeImage ? "inline" : "attachment"}; filename="${safeName}"`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    res.send(file.file_data);
  })
);

// Delete a file stored in Postgres (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const file = await FileService.deleteFile(req.params.id);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    res.json({ message: "File deleted successfully" });
  })
);

module.exports = router;
