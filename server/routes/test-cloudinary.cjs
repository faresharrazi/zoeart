const express = require("express");
const cloudinary = require("cloudinary").v2;
const { authenticateToken } = require("../middleware/auth.cjs");
const { asyncHandler } = require("../middleware/errorHandler.cjs");
const multer = require("multer");

const router = express.Router();

// Simple multer setup for testing
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
});

// Test Cloudinary connection (no auth required for debugging)
router.get(
  "/test",
  asyncHandler(async (req, res) => {
    console.log("=== CLOUDINARY TEST ===");
    console.log("Environment variables:", {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
        ? "Set"
        : "Not set",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
        ? "Set"
        : "Not set",
    });

    try {
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      console.log("Cloudinary config:", {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? "Set" : "Not set",
        api_secret: cloudinary.config().api_secret ? "Set" : "Not set",
      });

      // Test API connection
      const pingResult = await cloudinary.api.ping();
      console.log("Ping result:", pingResult);

      res.json({
        success: true,
        message: "Cloudinary connection successful",
        config: {
          cloud_name: cloudinary.config().cloud_name,
          api_key_set: !!cloudinary.config().api_key,
          api_secret_set: !!cloudinary.config().api_secret,
        },
        ping: pingResult,
      });
    } catch (error) {
      console.error("Cloudinary test error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  })
);

// Simple test upload (no auth required for debugging)
router.post(
  "/test-upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    console.log("=== SIMPLE CLOUDINARY UPLOAD TEST ===");
    console.log("File:", req.file ? "Present" : "Not present");
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    console.log("File details:", {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    try {
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Simple upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: 'zoeart/test',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              success: false,
              error: error.message
            });
          }
          
          console.log("Upload successful:", result);
          res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
          });
        }
      );

      // Pipe the file buffer to Cloudinary
      result.end(req.file.buffer);

    } catch (error) {
      console.error("Upload test error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  })
);

module.exports = router;
