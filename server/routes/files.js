const express = require("express");
const FileService = require("../services/fileService");
const {
  upload,
  handleUploadError,
  getFileCategory,
} = require("../config/multer");
const { authenticateToken } = require("../middleware/auth");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler");

const router = express.Router();

// Upload file (admin only)
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  handleUploadError,
  asyncHandler(async (req, res) => {
    console.log("=== FILE UPLOAD ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? "File present" : "No file");
    console.log("Request headers:", req.headers);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Content-Length:", req.headers["content-length"]);

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

    const result = await FileService.uploadFile(req.file, category, uploadedBy);
    console.log("File upload result:", result);

    res.json(result);
  })
);

// Get file by ID (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await FileService.getFileById(id);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Set appropriate headers
    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Length", file.file_size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.original_name}"`
    );

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
