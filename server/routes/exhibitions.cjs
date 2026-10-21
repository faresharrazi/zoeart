const express = require("express");
const { DatabaseService } = require("../services/database.cjs");
const { query } = require("../config/database.cjs");
const imageService = require("../services/imageService.cjs");
const { uniqueSlug } = require("../services/slug.cjs");
const { statusFromDates } = require("../services/exhibitionStatus.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler.cjs");

const router = express.Router();

const STATUSES = ["upcoming", "current", "past"];

const toExhibition = (exhibition) => ({
  id: exhibition.id,
  title: exhibition.title,
  slug: exhibition.slug,
  description: exhibition.description || "",
  start_date: exhibition.start_date,
  end_date: exhibition.end_date,
  location: exhibition.location || "",
  curator: exhibition.curator || "",
  status: statusFromDates(exhibition),
  featured_image: exhibition.featured_image || "",
  gallery_images: exhibition.gallery_images || [],
  assigned_artists: exhibition.assigned_artists || [],
  assigned_artworks: exhibition.assigned_artworks || [],
  call_for_artists: exhibition.call_for_artists || false,
  cta_link: exhibition.cta_link || "",
  press_media_name: exhibition.press_media_name || "",
  press_media_link: exhibition.press_media_link || "",
  is_visible: exhibition.is_visible !== false,
  created_at: exhibition.created_at,
  updated_at: exhibition.updated_at,
});

// Empty date inputs arrive as "" and must be stored as NULL.
const normalizeDates = (data) => {
  for (const field of ["start_date", "end_date"]) {
    if (data[field] === "") data[field] = null;
  }
  if (data.status !== undefined && !STATUSES.includes(data.status)) {
    throw new ValidationError(`Status must be one of: ${STATUSES.join(", ")}`);
  }
  return data;
};

// List exhibitions. Hidden ones are only included for admin requests.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM exhibitions
       ${req.isAdminRequest ? "" : "WHERE is_visible = TRUE"}
       ORDER BY start_date DESC NULLS LAST, created_at DESC`
    );
    res.json(rows.map(toExhibition));
  })
);

// Single exhibition by id or slug, with its visible artists.
router.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { rows } = await query(
      `SELECT * FROM exhibitions WHERE ${/^\d+$/.test(key) ? "id" : "slug"} = $1`,
      [key]
    );
    const exhibition = rows[0];

    if (!exhibition || (!exhibition.is_visible && !req.isAdminRequest)) {
      throw new NotFoundError("Exhibition not found");
    }

    const artistIds = (exhibition.assigned_artists || []).map(String);
    const artists = artistIds.length
      ? (
          await query(
            `SELECT id, name, slug, specialty, profile_image FROM artists
             WHERE id::text = ANY($1) AND is_visible = TRUE`,
            [artistIds]
          )
        ).rows.sort(
          (a, b) =>
            artistIds.indexOf(String(a.id)) - artistIds.indexOf(String(b.id))
        )
      : [];

    res.json({ ...toExhibition(exhibition), artists });
  })
);

// Create exhibition (admin only)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const data = normalizeDates({ ...req.body });

    if (!data.title) {
      throw new ValidationError("Title is required");
    }

    const exhibition = await DatabaseService.create("exhibitions", {
      ...data,
      slug: await uniqueSlug("exhibitions", data.slug || data.title),
      status: data.status || "upcoming",
      gallery_images: data.gallery_images || [],
      assigned_artists: data.assigned_artists || [],
      assigned_artworks: data.assigned_artworks || [],
      call_for_artists: data.call_for_artists || false,
      is_visible: data.is_visible !== false,
    });
    res.status(201).json(toExhibition(exhibition));
  })
);

// Update exhibition (admin only)
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const before = await DatabaseService.findById("exhibitions", id);
    if (!before) {
      throw new NotFoundError("Exhibition not found");
    }

    const data = normalizeDates({ ...req.body });
    if (data.slug !== undefined) {
      data.slug = await uniqueSlug(
        "exhibitions",
        data.slug || data.title || before.title,
        before.id
      );
    }

    const exhibition = await DatabaseService.update("exhibitions", id, data);
    await imageService.deleteUnusedImages(
      imageService.removedImageUrls(before, exhibition)
    );
    res.json(toExhibition(exhibition));
  })
);

// Delete exhibition (admin only). Its article is deleted by the database
// (ON DELETE CASCADE); images no other record uses are removed.
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const exhibition = await DatabaseService.delete(
      "exhibitions",
      req.params.id
    );
    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    await imageService.deleteUnusedImages(imageService.imageUrlsOf(exhibition));
    res.json({ message: "Exhibition deleted successfully" });
  })
);

// Toggle exhibition visibility (admin only)
router.patch(
  "/:id/visibility",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const exhibition = await DatabaseService.update(
      "exhibitions",
      req.params.id,
      { is_visible: req.body.is_visible !== false }
    );
    if (!exhibition) {
      throw new NotFoundError("Exhibition not found");
    }

    res.json({
      message: "Exhibition visibility updated successfully",
      exhibition: toExhibition(exhibition),
    });
  })
);

module.exports = router;
