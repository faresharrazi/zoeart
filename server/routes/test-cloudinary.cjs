const express = require("express");
const cloudinary = require("cloudinary").v2;
const { authenticateToken } = require("../middleware/auth.cjs");
const { asyncHandler } = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Test Cloudinary connection
router.get(
  "/test",
  authenticateToken,
  asyncHandler(async (req, res) => {
    console.log("=== CLOUDINARY TEST ===");
    console.log("Environment variables:", {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set"
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
        api_secret: cloudinary.config().api_secret ? "Set" : "Not set"
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
          api_secret_set: !!cloudinary.config().api_secret
        },
        ping: pingResult
      });

    } catch (error) {
      console.error("Cloudinary test error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  })
);

module.exports = router;
