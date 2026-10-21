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

const toArtwork = (artwork, isAdminRequest) => ({
  id: artwork.id,
  title: artwork.title,
  slug: artwork.slug,
  artist_id: artwork.artist_id,
  artist_name: artwork.artist_name || "",
  // Only link to artists the visitor can actually see
  artist_slug:
    artwork.artist_visible || isAdminRequest ? artwork.artist_slug || "" : "",
  year: artwork.year,
  medium: artwork.medium || "",
  size: artwork.size || "",
  description: artwork.description || "",
  images: artwork.images || [],
  featured_image: artwork.featured_image || (artwork.images || [])[0] || "",
  is_visible: artwork.is_visible !== false,
  created_at: artwork.created_at,
  updated_at: artwork.updated_at,
});

const SELECT_WITH_ARTIST = `
  SELECT w.*, a.name AS artist_name, a.slug AS artist_slug, a.is_visible AS artist_visible
  FROM artworks w
  LEFT JOIN artists a ON a.id = w.artist_id`;

// List artworks, optionally for one artist (?artist=<id or slug>).
// Hidden artworks are only included for admin requests.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const conditions = [];
    const params = [];
    if (!req.isAdminRequest) {
      conditions.push("w.is_visible = TRUE");
    }
    if (req.query.artist) {
      params.push(String(req.query.artist));
      conditions.push(
        /^\d+$/.test(req.query.artist)
          ? `w.artist_id = $${params.length}`
          : `a.slug = $${params.length}`
      );
    }

    const { rows } = await query(
      `${SELECT_WITH_ARTIST}
       ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY w.year DESC NULLS LAST, w.created_at DESC`,
      params
    );
    res.json(rows.map((row) => toArtwork(row, req.isAdminRequest)));
  })
);

// Single artwork by id or slug
router.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { rows } = await query(
      `${SELECT_WITH_ARTIST} WHERE w.${/^\d+$/.test(key) ? "id" : "slug"} = $1`,
      [key]
    );
    const artwork = rows[0];

    if (!artwork || (!artwork.is_visible && !req.isAdminRequest)) {
      throw new NotFoundError("Artwork not found");
    }

    // Summary of the artist for the artwork page (visible artists only)
    let artist = null;
    if (artwork.artist_id && (artwork.artist_visible || req.isAdminRequest)) {
      const result = await query(
        "SELECT id, name, slug, specialty, profile_image FROM artists WHERE id = $1",
        [artwork.artist_id]
      );
      artist = result.rows[0] || null;
    }

    res.json({ ...toArtwork(artwork, req.isAdminRequest), artist });
  })
);

// Create artwork (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const data = { ...req.body };

    if (!data.title) {
      throw new ValidationError("Title is required");
    }
    if (!data.artist_id) {
      throw new ValidationError("Artist ID is required");
    }

    const artwork = await DatabaseService.create("artworks", {
      ...data,
      slug: await uniqueSlug("artworks", data.slug || data.title),
      artist_id: parseInt(data.artist_id, 10),
      year: data.year || new Date().getFullYear(),
      images: data.images || [],
      is_visible: data.is_visible !== false,
    });
    res.status(201).json(toArtwork(artwork, true));
  })
);

// Update artwork (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const before = await DatabaseService.findById("artworks", id);
    if (!before) {
      throw new NotFoundError("Artwork not found");
    }

    const data = { ...req.body };
    if (data.slug !== undefined) {
      data.slug = await uniqueSlug(
        "artworks",
        data.slug || data.title || before.title,
        before.id
      );
    }

    const artwork = await DatabaseService.update("artworks", id, data);
    await imageService.deleteUnusedImages(
      imageService.removedImageUrls(before, artwork)
    );
    res.json(toArtwork(artwork, true));
  })
);

// Delete artwork (admin only), removing it from exhibitions and artists
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const artwork = await transaction(async (client) => {
      const { rows } = await client.query(
        "DELETE FROM artworks WHERE id = $1 RETURNING *",
        [id]
      );
      if (rows[0]) {
        await DatabaseService.removeIdFromLists(
          "exhibitions",
          "assigned_artworks",
          id,
          client
        );
        await DatabaseService.removeIdFromLists(
          "artists",
          "assigned_artworks",
          id,
          client
        );
      }
      return rows[0];
    });

    if (!artwork) {
      throw new NotFoundError("Artwork not found");
    }

    await imageService.deleteUnusedImages(imageService.imageUrlsOf(artwork));
    res.json({ message: "Artwork deleted successfully" });
  })
);

module.exports = router;
