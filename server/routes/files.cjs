const express = require("express");
const FileService = require("../services/fileService.cjs");
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

// Upload file (admin only)
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  handleUploadError,
  asyncHandler(async (req, res) => {

    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const category = getFileCategory(req);
    const uploadedBy = req.user?.id || null;


    const result = await FileService.uploadFile(req.file, category, uploadedBy);

    res.json(result);
  })
);

// Get all files (admin only)
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    const files = category
      ? await FileService.getFilesByCategory(category)
      : await FileService.getAllFiles();
    res.json(files);
  })
);

// Get hero images (public) - REMOVED: Now handled by /api/hero-images route
// router.get(
//   "/hero-images",
//   asyncHandler(async (req, res) => {
//     const heroImages = await FileService.getFilesByCategory("hero");
//     res.json({
//       success: true,
//       data: heroImages,
//     });
//   })
// );

// Get file by ID (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await FileService.getFileById(id);

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

    // Send binary data
    res.send(file.file_data);
  })
);

// Get file metadata (admin only)
router.get(
  "/:id/metadata",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await FileService.getFileById(id);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Return metadata without binary data
    const metadata = {
      id: file.id,
      original_name: file.original_name,
      filename: file.filename,
      file_path: file.file_path,
      file_size: file.file_size,
      mime_type: file.mime_type,
      category: file.category,
      uploaded_by: file.uploaded_by,
      created_at: file.created_at,
      updated_at: file.updated_at,
    };

    res.json(metadata);
  })
);

// Get files by category (admin only)
router.get(
  "/category/:category",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { category } = req.params;

    const files = await FileService.getFilesByCategory(category);
    res.json(files);
  })
);

// Delete file (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await FileService.deleteFile(id);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    res.json({ message: "File deleted successfully" });
  })
);

// Get file statistics (admin only)
router.get(
  "/stats/summary",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const stats = await FileService.getFileStats();
    res.json(stats);
  })
);

// Update file metadata (admin only)
router.patch(
  "/:id/metadata",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const metadata = req.body;

    const file = await FileService.updateFileMetadata(id, metadata);
    res.json(file);
  })
);

// Clean up old files (admin only)
router.post(
  "/cleanup",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { daysOld = 30 } = req.body;

    const deletedCount = await FileService.cleanupOldFiles(daysOld);

    res.json({
      message: `Cleaned up ${deletedCount} old files`,
      deletedCount,
    });
  })
);

module.exports = router;
