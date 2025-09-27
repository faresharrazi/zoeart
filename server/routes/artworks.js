const express = require("express");
const { ArtworkService } = require("../services/database");
const { authenticateToken } = require("../middleware/auth");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler");

const router = express.Router();

// Get all artworks (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const artworks = await ArtworkService.getAll();

    // Transform data for frontend
    const transformedArtworks = artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      slug: artwork.slug,
      artist_id: artwork.artist_id,
      artist_name: artwork.artist_name || "Unknown Artist",
      year: artwork.year || new Date().getFullYear(),
      medium: artwork.medium || "",
      size: artwork.size || "",
      description: artwork.description || "",
      images: artwork.images || [],
      is_visible: artwork.is_visible !== false,
      created_at: artwork.created_at,
      updated_at: artwork.updated_at,
    }));

    res.json(transformedArtworks);
  })
);

// Get single artwork (public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const artwork = await ArtworkService.getById(id);

    if (!artwork) {
      throw new NotFoundError("Artwork not found");
    }

    // Transform data for frontend
    const transformedArtwork = {
      id: artwork.id,
      title: artwork.title,
      slug: artwork.slug,
      artist_id: artwork.artist_id,
      artist_name: artwork.artist_name || "Unknown Artist",
      year: artwork.year || new Date().getFullYear(),
      medium: artwork.medium || "",
      size: artwork.size || "",
      description: artwork.description || "",
      images: artwork.images || [],
      is_visible: artwork.is_visible !== false,
      created_at: artwork.created_at,
      updated_at: artwork.updated_at,
    };

    res.json(transformedArtwork);
  })
);

// Create artwork (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      artist_id,
      year,
      medium,
      size,
      description,
      images,
      is_visible,
    } = req.body;

    if (!title) {
      throw new ValidationError("Title is required");
    }

    if (!artist_id) {
      throw new ValidationError("Artist ID is required");
    }

    const artworkData = {
      title,
      slug:
        slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      artist_id: parseInt(artist_id),
      year: year || new Date().getFullYear(),
      medium: medium || "",
      size: size || "",
      description: description || "",
      images: images || [],
      is_visible: is_visible !== false,
    };

    const artwork = await ArtworkService.create(artworkData);
    res.status(201).json(artwork);
  })
);

// Update artwork (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const artwork = await ArtworkService.update(id, updateData);

    if (!artwork) {
      throw new NotFoundError("Artwork not found");
    }

    res.json(artwork);
  })
);

// Delete artwork (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const artwork = await ArtworkService.delete(id);

    if (!artwork) {
      throw new NotFoundError("Artwork not found");
    }

    res.json({ message: "Artwork deleted successfully" });
  })
);

// Get visible artworks only
router.get(
  "/visible/only",
  asyncHandler(async (req, res) => {
    const artworks = await ArtworkService.findAll(
      "artworks",
      { is_visible: true },
      "created_at DESC"
    );
    res.json(artworks);
  })
);

// Get artworks by artist
router.get(
  "/artist/:artistId",
  asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const artworks = await ArtworkService.findAll(
      "artworks",
      { artist_id: artistId },
      "created_at DESC"
    );
    res.json(artworks);
  })
);

// Get artworks by year
router.get(
  "/year/:year",
  asyncHandler(async (req, res) => {
    const { year } = req.params;

    const artworks = await ArtworkService.findAll(
      "artworks",
      { year: parseInt(year) },
      "created_at DESC"
    );
    res.json(artworks);
  })
);

module.exports = router;
