const express = require("express");
const { query } = require("../config/database.cjs");
const { asyncHandler } = require("../middleware/errorHandler.cjs");

// Search engines run the site's JavaScript, but social networks building
// link previews (Facebook, WhatsApp, LinkedIn, Slack...) don't. vercel.json
// sends those bots here so shared links show the right title, text and
// image. People and search engines always get the normal site.

const router = express.Router();

const SITE_NAME = "Aether Art Space";
const DEFAULT_DESCRIPTION =
  "Contemporary art gallery in Glyfada, Athens: exhibitions, artists and a collection of works from emerging and established artists.";

const siteUrl = (req) =>
  (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");

const escapeHtml = (text) =>
  String(text ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );

const plainText = (text, max = 200) => {
  const plain = String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1).trimEnd()}…` : plain;
};

// 1200x630 preview image; Cloudinary resizes it, other URLs are made absolute
const shareImage = (url, base) => {
  if (!url) return `${base}/og-image.jpg`;
  const match = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/
  );
  if (match) return `${match[1]}f_jpg,q_auto,w_1200,h_630,c_fill/${match[2]}`;
  return url.startsWith("http") ? url : `${base}${url}`;
};

const sharePage = ({
  base,
  path,
  title,
  description,
  image,
  type = "website",
}) => {
  const url = `${base}${path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const text = plainText(description) || DEFAULT_DESCRIPTION;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(text)}">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(text)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(fullTitle)}">
<meta name="twitter:description" content="${escapeHtml(text)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body>
<h1>${escapeHtml(title || SITE_NAME)}</h1>
<p>${escapeHtml(text)}</p>
<p><a href="${escapeHtml(url)}">View on ${SITE_NAME}</a></p>
</body>
</html>`;
};

const sendSharePage = (res, page) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
  res.send(sharePage(page));
};

const PAGES = {
  "/": { name: "home" },
  "/exhibitions": { name: "exhibitions", fallback: "Exhibitions" },
  "/artists": { name: "artists", fallback: "Artists" },
  "/collection": { name: "gallery", fallback: "Collection" },
  "/about": { name: "about", fallback: "About" },
  "/contact": { name: "contact", fallback: "Contact" },
};

for (const [path, { name, fallback }] of Object.entries(PAGES)) {
  router.get(
    path,
    asyncHandler(async (req, res) => {
      const { rows } = await query(
        "SELECT title, description FROM page_content WHERE page_name = $1",
        [name]
      );
      const page = rows[0] || {};
      sendSharePage(res, {
        base: siteUrl(req),
        path,
        // The home page title is the gallery name itself
        title: name === "home" ? null : page.title || fallback,
        description: page.description,
        image: shareImage(null, siteUrl(req)),
      });
    })
  );
}

// Detail pages: [path prefix, table, title column, description, image]
const DETAIL_PAGES = [
  [
    "exhibition",
    "exhibitions",
    "title",
    "description",
    "featured_image",
    "article",
  ],
  ["artist", "artists", "name", "bio", "profile_image", "profile"],
  ["artwork", "artworks", "title", "description", "featured_image", "website"],
];

for (const [
  prefix,
  table,
  titleColumn,
  textColumn,
  imageColumn,
  type,
] of DETAIL_PAGES) {
  router.get(
    `/${prefix}/:slug`,
    asyncHandler(async (req, res, next) => {
      const { rows } = await query(
        `SELECT ${titleColumn} AS title, ${textColumn} AS description,
                ${imageColumn} AS image${table === "artworks" ? ", images" : ""}
         FROM ${table} WHERE slug = $1 AND is_visible = TRUE`,
        [req.params.slug]
      );
      const item = rows[0];
      if (!item) return next(); // falls through to the 404 handler

      const image =
        item.image || (Array.isArray(item.images) ? item.images[0] : null);
      sendSharePage(res, {
        base: siteUrl(req),
        path: `/${prefix}/${encodeURIComponent(req.params.slug)}`,
        title: item.title,
        description: item.description,
        image: shareImage(image, siteUrl(req)),
        type,
      });
    })
  );
}

// Sitemap of every visible page, for search engines
router.get(
  "/sitemap.xml",
  asyncHandler(async (req, res) => {
    const base = siteUrl(req);
    const [pages, exhibitions, artists, artworks] = await Promise.all([
      query("SELECT page_name, is_visible FROM page_content"),
      query("SELECT slug, updated_at FROM exhibitions WHERE is_visible = TRUE"),
      query("SELECT slug, updated_at FROM artists WHERE is_visible = TRUE"),
      query("SELECT slug, updated_at FROM artworks WHERE is_visible = TRUE"),
    ]);

    const hidden = new Set(
      pages.rows.filter((p) => p.is_visible === false).map((p) => p.page_name)
    );
    const entries = Object.entries(PAGES)
      .filter(([, { name }]) => !hidden.has(name))
      .map(([path]) => ({ path }));
    for (const [prefix, rows] of [
      ["exhibition", exhibitions.rows],
      ["artist", artists.rows],
      ["artwork", artworks.rows],
    ]) {
      for (const row of rows) {
        entries.push({
          path: `/${prefix}/${encodeURIComponent(row.slug)}`,
          lastmod: row.updated_at,
        });
      }
    }

    const urls = entries
      .map(
        ({ path, lastmod }) =>
          `  <url><loc>${escapeHtml(base + path)}</loc>${
            lastmod
              ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>`
              : ""
          }</url>`
      )
      .join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
  })
);

module.exports = router;
