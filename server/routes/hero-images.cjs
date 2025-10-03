const express = require("express");
const { query } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");
const imageService = require("../services/imageService.cjs");

const router = express.Router();

// Get all hero images (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.log("=== HERO IMAGES API CALL ===");
    console.log("Request headers:", req.headers);
    console.log("Request IP:", req.ip);
    console.log("Request user-agent:", req.get('User-Agent'));
    console.log("Fetching hero images...");
    
    try {
      const heroImages = await query(
        `SELECT * FROM hero_images 
         WHERE is_active = true 
         ORDER BY display_order ASC, created_at DESC`
      );

      console.log(`Found ${heroImages.rows.length} hero images`);
      console.log("Hero images data:", heroImages.rows.map(img => ({
        id: img.id,
        cloudinary_url: img.cloudinary_url,
        is_active: img.is_active,
        display_order: img.display_order
      })));

      res.json({
        success: true,
        data: heroImages.rows,
      });
    } catch (error) {
      console.error("Error in hero images query:", error);
      res.status(500).json({
        success: false,
        error: "Database error",
        details: error.message
      });
    }
  })
);

// Get hero image by ID (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
      "SELECT * FROM hero_images WHERE id = $1 AND is_active = true",
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Hero image not found");
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Upload hero image (admin only)
router.post(
  "/upload",
  authenticateToken,
  asyncHandler(async (req, res) => {
    console.log("=== HERO IMAGE UPLOAD ===");
    console.log("Request body:", req.body);

    const { cloudinary_url, cloudinary_public_id, original_name, file_size, mime_type, width, height, format, display_order } = req.body;

    if (!cloudinary_url || !cloudinary_public_id || !original_name) {
      throw new ValidationError("Missing required fields: cloudinary_url, cloudinary_public_id, original_name");
    }

    const uploadedBy = req.user?.id || null;

    console.log("Hero image data:", {
      cloudinary_url,
      cloudinary_public_id,
      original_name,
      file_size,
      mime_type,
      width,
      height,
      format,
      display_order: display_order || 0,
      uploaded_by: uploadedBy,
    });

    const result = await query(
      `INSERT INTO hero_images 
       (cloudinary_url, cloudinary_public_id, original_name, file_size, mime_type, width, height, format, display_order, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        cloudinary_url,
        cloudinary_public_id,
        original_name,
        file_size || null,
        mime_type || null,
        width || null,
        height || null,
        format || null,
        display_order || 0,
        uploadedBy,
      ]
    );

    console.log("Hero image created:", result.rows[0]);

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Update hero image (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { display_order, is_active } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramCount}`);
      updateValues.push(display_order);
      paramCount++;
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      updateValues.push(is_active);
      paramCount++;
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No fields to update");
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await query(
      `UPDATE hero_images 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Hero image not found");
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Delete hero image (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get the hero image first to delete from Cloudinary
    const heroImage = await query(
      "SELECT cloudinary_public_id FROM hero_images WHERE id = $1",
      [id]
    );

    if (heroImage.rows.length === 0) {
      throw new NotFoundError("Hero image not found");
    }

    // Delete from Cloudinary
    if (heroImage.rows[0].cloudinary_public_id) {
      try {
        await imageService.deleteImage({
          id: heroImage.rows[0].cloudinary_public_id,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${heroImage.rows[0].cloudinary_public_id}`
        });
        console.log("Hero image deleted from Cloudinary:", heroImage.rows[0].cloudinary_public_id);
      } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    const result = await query(
      "DELETE FROM hero_images WHERE id = $1 RETURNING *",
      [id]
    );

    res.json({
      success: true,
      message: "Hero image deleted successfully",
      data: result.rows[0],
    });
  })
);

// Bulk upload hero images (admin only)
router.post(
  "/bulk-upload",
  authenticateToken,
  asyncHandler(async (req, res) => {
    console.log("=== BULK HERO IMAGE UPLOAD ===");
    console.log("Request body:", req.body);

    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      throw new ValidationError("Images array is required");
    }

    const uploadedBy = req.user?.id || null;
    const results = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const { cloudinary_url, cloudinary_public_id, original_name, file_size, mime_type, width, height, format } = image;

      if (!cloudinary_url || !cloudinary_public_id || !original_name) {
        results.push({
          success: false,
          error: "Missing required fields",
          original_name: original_name || "unknown",
        });
        continue;
      }

      try {
        const result = await query(
          `INSERT INTO hero_images 
           (cloudinary_url, cloudinary_public_id, original_name, file_size, mime_type, width, height, format, display_order, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            cloudinary_url,
            cloudinary_public_id,
            original_name,
            file_size || null,
            mime_type || null,
            width || null,
            height || null,
            format || null,
            i, // Use index as display order
            uploadedBy,
          ]
        );

        results.push({
          success: true,
          data: result.rows[0],
        });
      } catch (error) {
        console.error(`Error uploading hero image ${original_name}:`, error);
        results.push({
          success: false,
          error: error.message,
          original_name,
        });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.json({
      success: true,
      uploaded: successful,
      errors: failed,
      totalUploaded: successful.length,
      totalErrors: failed.length,
    });
  })
);

module.exports = router;
