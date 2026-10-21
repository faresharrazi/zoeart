const express = require("express");
const { DatabaseService } = require("../services/database.cjs");
const { query, transaction } = require("../config/database.cjs");
const imageService = require("../services/imageService.cjs");
const { uniqueSlug } = require("../services/slug.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

const toArtist = (artist) => ({
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
});

// List artists. Hidden ones are only included for admin requests.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM artists
       ${req.isAdminRequest ? "" : "WHERE is_visible = TRUE"}
       ORDER BY name ASC`
    );
    res.json(rows.map(toArtist));
  })
);

// Single artist by id or slug
router.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { rows } = await query(
      `SELECT * FROM artists WHERE ${/^\d+$/.test(key) ? "id" : "slug"} = $1`,
      [key]
    );
    const artist = rows[0];

    if (!artist || (!artist.is_visible && !req.isAdminRequest)) {
      throw new NotFoundError("Artist not found");
    }

    res.json(toArtist(artist));
  })
);

// Create artist (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const data = { ...req.body };

    if (!data.name) {
      throw new ValidationError("Name is required");
    }

    const artist = await DatabaseService.create("artists", {
      ...data,
      slug: await uniqueSlug("artists", data.slug || data.name),
      social_media: data.social_media || {},
      assigned_artworks: data.assigned_artworks || [],
      is_visible: data.is_visible !== false,
    });
    res.status(201).json(toArtist(artist));
  })
);

// Update artist (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const before = await DatabaseService.findById("artists", id);
    if (!before) {
      throw new NotFoundError("Artist not found");
    }

    const data = { ...req.body };
    if (data.slug !== undefined) {
      data.slug = await uniqueSlug(
        "artists",
        data.slug || data.name || before.name,
        before.id
      );
    }

    const artist = await DatabaseService.update("artists", id, data);
    await imageService.deleteUnusedImages(
      imageService.removedImageUrls(before, artist)
    );
    res.json(toArtist(artist));
  })
);

// Delete artist (admin only). Their artworks stay, without an artist.
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const artist = await transaction(async (client) => {
      const { rows } = await client.query(
        "DELETE FROM artists WHERE id = $1 RETURNING *",
        [id]
      );
      if (rows[0]) {
        await DatabaseService.removeIdFromLists(
          "exhibitions",
          "assigned_artists",
          id,
          client
        );
      }
      return rows[0];
    });

    if (!artist) {
      throw new NotFoundError("Artist not found");
    }

    await imageService.deleteUnusedImages(imageService.imageUrlsOf(artist));
    res.json({ message: "Artist deleted successfully" });
  })
);

module.exports = router;
