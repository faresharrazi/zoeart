require("dotenv").config({ path: [".env.local", ".env"], quiet: true });

const { Pool } = require("pg");

// Copies the public content of the live site (through its API) into a LOCAL
// database, so local development shows real exhibitions, texts and contact
// details. Only what visitors can see is copied; nothing is written to the
// live site.
//
//   npm run db:import-live                  # from https://www.aetherartspace.com
//   node scripts/import-live-content.cjs https://preview-url.vercel.app

const SITE = (process.argv[2] || "https://www.aetherartspace.com").replace(
  /\/$/,
  ""
);

const getJson = async (path, { optional = false } = {}) => {
  const response = await fetch(`${SITE}/api${path}`);
  if (optional && response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${path}: HTTP ${response.status}`);
  return response.json();
};

// Images kept in the live database are served by the live API
const liveImage = (url) => {
  if (!url || typeof url !== "string") return url || null;
  if (url.startsWith("http")) return url;
  const id = url.replace(/^\/api\/files?\//, "");
  return `${SITE}/api/files/${id}`;
};

// Older admin versions saved whole page objects inside `content`
const cleanContent = (content) =>
  content && typeof content === "object" && !("page_name" in content)
    ? content
    : {};

const day = (value) => (value ? String(value).slice(0, 10) : null);
const json = (value) => JSON.stringify(value ?? []);

async function importLiveContent() {
  const connectionString = process.env.DATABASE_URL || "";
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(connectionString)) {
    throw new Error(
      "Refusing to run: DATABASE_URL must point to a local database"
    );
  }

  console.log(`Reading public content from ${SITE}...`);
  const [
    pages,
    exhibitions,
    artists,
    artworks,
    heroImages,
    aboutBlocks,
    hours,
  ] = await Promise.all([
    getJson("/page-content"),
    getJson("/exhibitions"),
    getJson("/artists"),
    getJson("/artworks"),
    getJson("/hero-images"),
    getJson("/about-blocks"),
    getJson("/working-hours"),
  ]);
  const articles = (
    await Promise.all(
      exhibitions.map((e) =>
        getJson(`/articles/exhibition/${e.id}`, { optional: true })
      )
    )
  )
    .filter(Boolean)
    .map((response) => response.data);

  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "TRUNCATE articles, exhibitions, artworks, artists, hero_images, about_blocks RESTART IDENTITY CASCADE"
    );

    for (const a of artists) {
      await client.query(
        `INSERT INTO artists (id, name, slug, bio, specialty, profile_image, social_media, assigned_artworks, is_visible)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          a.id,
          a.name,
          a.slug,
          a.bio,
          a.specialty,
          liveImage(a.profile_image),
          JSON.stringify(a.social_media || {}),
          json(a.assigned_artworks),
          a.is_visible !== false,
        ]
      );
    }
    for (const w of artworks) {
      const images = (w.images || []).map(liveImage);
      await client.query(
        `INSERT INTO artworks (id, title, slug, artist_id, year, medium, size, description, images, featured_image, is_visible)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          w.id,
          w.title,
          w.slug,
          artists.some((a) => a.id === w.artist_id) ? w.artist_id : null,
          w.year,
          w.medium,
          w.size,
          w.description,
          json(images),
          liveImage(w.featured_image) || images[0] || null,
          w.is_visible !== false,
        ]
      );
    }
    for (const e of exhibitions) {
      await client.query(
        `INSERT INTO exhibitions (id, title, slug, description, start_date, end_date, location, curator, status,
           featured_image, gallery_images, assigned_artists, assigned_artworks, call_for_artists, cta_link,
           press_media_name, press_media_link, is_visible)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          e.id,
          e.title,
          e.slug,
          e.description,
          day(e.start_date),
          day(e.end_date),
          e.location,
          e.curator,
          e.status,
          liveImage(e.featured_image),
          json((e.gallery_images || []).map(liveImage)),
          json(e.assigned_artists),
          json(e.assigned_artworks),
          Boolean(e.call_for_artists),
          e.cta_link,
          e.press_media_name,
          e.press_media_link,
          e.is_visible !== false,
        ]
      );
    }
    for (const a of articles) {
      await client.query(
        `INSERT INTO articles (id, exhibition_id, title, content, featured_image, media_files, author, published_at, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)`,
        [
          a.id,
          a.exhibition_id,
          a.title,
          a.content,
          liveImage(a.featured_image),
          json(a.media_files),
          a.author,
          a.published_at,
        ]
      );
    }
    for (const h of heroImages.data || []) {
      await client.query(
        `INSERT INTO hero_images (id, cloudinary_url, cloudinary_public_id, original_name, width, height, format, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)`,
        [
          h.id,
          h.cloudinary_url,
          h.cloudinary_public_id,
          h.original_name,
          h.width,
          h.height,
          h.format,
          h.display_order || 0,
        ]
      );
    }
    for (const b of aboutBlocks.data || []) {
      await client.query(
        `INSERT INTO about_blocks (id, block_id, title, content, is_visible, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          b.id,
          b.block_id,
          b.title,
          b.content,
          b.is_visible !== false,
          b.sort_order || 0,
        ]
      );
    }

    for (const [name, page] of Object.entries(pages.pages || {})) {
      await client.query(
        `INSERT INTO page_content (page_name, title, description, content, is_visible)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (page_name) DO UPDATE
         SET title = $2, description = $3, content = $4, is_visible = $5`,
        [
          name,
          page.title,
          page.description,
          JSON.stringify(cleanContent(page.content)),
          page.isVisible !== false,
        ]
      );
    }

    const contact = pages.contactInfo || {};
    await client.query("DELETE FROM contact_info");
    await client.query(
      "INSERT INTO contact_info (email, phone, instagram, address) VALUES ($1, $2, $3, $4)",
      [
        contact.email || "",
        contact.phone || "",
        contact.instagram || "",
        contact.address || "",
      ]
    );

    await client.query("DELETE FROM working_hours");
    for (const h of hours) {
      await client.query(
        "INSERT INTO working_hours (day, time_frame, is_active) VALUES ($1, $2, $3)",
        [h.day, h.time_frame, h.is_active !== false]
      );
    }

    // Keep id sequences ahead of the imported ids
    for (const table of [
      "artists",
      "artworks",
      "exhibitions",
      "articles",
      "hero_images",
      "about_blocks",
    ]) {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${table}), 1))`
      );
    }

    await client.query("COMMIT");
    console.log(
      `Imported ${exhibitions.length} exhibitions, ${artists.length} artists, ${artworks.length} artworks, ` +
        `${articles.length} articles, ${(heroImages.data || []).length} hero images, ` +
        `${(aboutBlocks.data || []).length} about blocks, page texts and contact details`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importLiveContent().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
