const express = require("express");
const { ExhibitionService } = require("../services/database");
const { authenticateToken } = require("../middleware/auth");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler");

const router = express.Router();

// Get all exhibitions (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const exhibitions = await ExhibitionService.getAll();

    // Transform data for frontend
    const transformedExhibitions = exhibitions.map((exhibition) => ({
      id: exhibition.id,
      title: exhibition.title,
      slug: exhibition.slug,
      description: exhibition.description || "",
      start_date: exhibition.start_date,
      end_date: exhibition.end_date,
      location: exhibition.location || "",
      curator: exhibition.curator || "",
      status: exhibition.status,
      featured_image: exhibition.featured_image || "",
      gallery_images: exhibition.gallery_images || [],
      assigned_artists: exhibition.assigned_artists || [],
      assigned_artworks: exhibition.assigned_artworks || [],
      call_for_artists: exhibition.call_for_artists || false,
      cta_link: exhibition.cta_link || "",
      is_visible: exhibition.is_visible !== false,
      created_at: exhibition.created_at,
      updated_at: exhibition.updated_at,
    }));

    res.json(transformedExhibitions);
  })
);

// Get single exhibition (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const exhibition = await ExhibitionService.getById(id);

    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    // Transform data for frontend
    const transformedExhibition = {
      id: exhibition.id,
      title: exhibition.title,
      slug: exhibition.slug,
      description: exhibition.description || "",
      start_date: exhibition.start_date,
      end_date: exhibition.end_date,
      location: exhibition.location || "",
      curator: exhibition.curator || "",
      status: exhibition.status,
      featured_image: exhibition.featured_image || "",
      gallery_images: exhibition.gallery_images || [],
      assigned_artists: exhibition.assigned_artists || [],
      assigned_artworks: exhibition.assigned_artworks || [],
      call_for_artists: exhibition.call_for_artists || false,
      cta_link: exhibition.cta_link || "",
      is_visible: exhibition.is_visible !== false,
      created_at: exhibition.created_at,
      updated_at: exhibition.updated_at,
    };

    res.json(transformedExhibition);
  })
);

// Create exhibition (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      description,
      start_date,
      end_date,
      location,
      curator,
      status,
      featured_image,
      gallery_images,
      assigned_artists,
      assigned_artworks,
      call_for_artists,
      cta_link,
      is_visible,
    } = req.body;

    if (!title) {
      throw new ValidationError("Title is required");
    }

    const exhibitionData = {
      title,
      slug:
        slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      description: description || "",
      start_date: start_date || null,
      end_date: end_date || null,
      location: location || "",
      curator: curator || "",
      status: status || "upcoming",
      featured_image: featured_image || "",
      gallery_images: gallery_images || [],
      assigned_artists: assigned_artists || [],
      assigned_artworks: assigned_artworks || [],
      call_for_artists: call_for_artists || false,
      cta_link: cta_link || "",
      is_visible: is_visible !== false,
    };

    const exhibition = await ExhibitionService.create(exhibitionData);
    res.status(201).json(exhibition);
  })
);

// Update exhibition (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const exhibition = await ExhibitionService.update(id, updateData);

    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    res.json(exhibition);
  })
);

// Delete exhibition (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const exhibition = await ExhibitionService.delete(id);

    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    res.json({ message: "Exhibition deleted successfully" });
  })
);

// Toggle exhibition visibility (admin only)
router.patch(
  "/:id/visibility",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { is_visible } = req.body;

    console.log("=== TOGGLING EXHIBITION VISIBILITY ===");
    console.log("Exhibition ID:", id);
    console.log("Request body:", req.body);
    console.log("Setting visibility to:", is_visible);

    const exhibition = await ExhibitionService.toggleVisibility(id, is_visible);

    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    console.log("Exhibition visibility updated successfully");
    res.json({
      message: "Exhibition visibility updated successfully",
      exhibition,
    });
  })
);

// Get exhibitions by status
router.get(
  "/status/:status",
  asyncHandler(async (req, res) => {
    const { status } = req.params;

    if (!["upcoming", "past"].includes(status)) {
      throw new ValidationError("Invalid status. Must be 'upcoming' or 'past'");
    }

    const exhibitions = await ExhibitionService.findAll(
      "exhibitions",
      { status },
      "created_at DESC"
    );
    res.json(exhibitions);
  })
);

// Get visible exhibitions only
router.get(
  "/visible/only",
  asyncHandler(async (req, res) => {
    const exhibitions = await ExhibitionService.findAll(
      "exhibitions",
      { is_visible: true },
      "created_at DESC"
    );
    res.json(exhibitions);
  })
);

module.exports = router;
