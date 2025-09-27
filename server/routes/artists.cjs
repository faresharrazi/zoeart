const express = require("express");
const { ArtistService } = require("../services/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const { asyncHandler, ValidationError, NotFoundError } = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Get visible artists only (public)
router.get("/", asyncHandler(async (req, res) => {
  const artists = await ArtistService.findVisible();
  
  // Transform data for frontend
  const transformedArtists = artists.map(artist => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    specialty: artist.specialty || "",
    bio: artist.bio || "",
    profile_image: artist.profile_image || "",
    social_media: artist.social_media || {},
    assigned_artworks: artist.assigned_artworks || [],
    is_visible: artist.is_visible !== false,
    created_at: artist.created_at,
    updated_at: artist.updated_at,
  }));

  res.json(transformedArtists);
}));

// Get single artist (public)
router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artist = await ArtistService.getById(id);
  
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  // Transform data for frontend
  const transformedArtist = {
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    specialty: artist.specialty || "",
    bio: artist.bio || "",
    profile_image: artist.profile_image || "",
    social_media: artist.social_media || {},
    assigned_artworks: artist.assigned_artworks || [],
    is_visible: artist.is_visible !== false,
    created_at: artist.created_at,
    updated_at: artist.updated_at,
  };

  res.json(transformedArtist);
}));

// Create artist (admin only)
router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    specialty,
    bio,
    profile_image,
    social_media,
    assigned_artworks,
    is_visible,
  } = req.body;

  if (!name) {
    throw new ValidationError("Name is required");
  }

  const artistData = {
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    specialty: specialty || "",
    bio: bio || "",
    profile_image: profile_image || "",
    social_media: social_media || {},
    assigned_artworks: assigned_artworks || [],
    is_visible: is_visible !== false,
  };

  const artist = await ArtistService.create(artistData);
  res.status(201).json(artist);
}));

// Update artist (admin only)
router.put("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const artist = await ArtistService.update(id, updateData);
  
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  res.json(artist);
}));

// Delete artist (admin only)
router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const artist = await ArtistService.delete(id);
  
  if (!artist) {
    throw new NotFoundError("Artist not found");
  }

  res.json({ message: "Artist deleted successfully" });
}));

// Get visible artists only
router.get("/visible/only", asyncHandler(async (req, res) => {
  const artists = await ArtistService.findAll("artists", { is_visible: true }, "name ASC");
  res.json(artists);
}));

// Get artists by specialty
router.get("/specialty/:specialty", asyncHandler(async (req, res) => {
  const { specialty } = req.params;
  
  const artists = await ArtistService.findAll("artists", { specialty }, "name ASC");
  res.json(artists);
}));

module.exports = router;
