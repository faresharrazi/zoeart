const crypto = require("crypto");
const express = require("express");
const { query } = require("../config/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const { asyncHandler } = require("../middleware/errorHandler.cjs");

// Cookie-free visit statistics for the admin panel.
//
// Each page view stores the page, where the visitor came from, the device
// type and the country (from Vercel's geo header). No IP address or cookie is
// kept: visitors are counted with a hash of IP + browser and a random salt
// that changes every day and is then deleted, so the same person can't be
// recognised from one day to the next.

const router = express.Router();

const TIME_ZONE = "Europe/Athens";

// Pages the site has; anything else (typos, probes) isn't recorded
const TRACKED_PATH =
  /^\/(?:|exhibitions|artists|collection|about|contact|(?:exhibition|artist|artwork)\/[a-z0-9-]{1,200})$/;

const BOT =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http-client|java\/|okhttp/i;

const deviceOf = (userAgent) => {
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(userAgent))
    return "tablet";
  if (/mobi|iphone|ipod|android|windows phone/i.test(userAgent))
    return "mobile";
  return "desktop";
};

// Today's salt in the gallery's time zone, created on first use. Salts older
// than yesterday are deleted, which makes old visitor ids unlinkable.
let cachedSalt = { day: null, salt: null };
const dailySalt = async () => {
  const { rows } = await query(
    `SELECT (now() AT TIME ZONE '${TIME_ZONE}')::date::text AS day`
  );
  const day = rows[0].day;
  if (cachedSalt.day === day) return cachedSalt.salt;

  await query(
    `INSERT INTO analytics_salts (day, salt) VALUES ($1, $2)
     ON CONFLICT (day) DO NOTHING`,
    [day, crypto.randomBytes(32).toString("hex")]
  );
  await query("DELETE FROM analytics_salts WHERE day < $1::date - 1", [day]);
  const saved = await query("SELECT salt FROM analytics_salts WHERE day = $1", [
    day,
  ]);
  cachedSalt = { day, salt: saved.rows[0].salt };
  return cachedSalt.salt;
};

const referrerHost = (referrer, ownHost) => {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host &&
      host !==
        String(ownHost)
          .replace(/^www\./, "")
          .split(":")[0]
      ? host.slice(0, 200)
      : null;
  } catch {
    return null;
  }
};

// Record a page view (public; sent by the site on every page change)
router.post(
  "/pageview",
  asyncHandler(async (req, res) => {
    const userAgent = String(req.headers["user-agent"] || "");
    const path =
      String(req.body?.path || "")
        .toLowerCase()
        .replace(/\/+$/, "") || "/";

    if (!userAgent || BOT.test(userAgent) || !TRACKED_PATH.test(path)) {
      return res.status(204).end();
    }

    const ip = String(
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""
    )
      .split(",")[0]
      .trim();
    const visitorId = crypto
      .createHash("sha256")
      .update(`${await dailySalt()}|${ip}|${userAgent}`)
      .digest("hex")
      .slice(0, 16);
    const country = String(req.headers["x-vercel-ip-country"] || "")
      .toUpperCase()
      .slice(0, 2);
    const utmSource = String(req.body?.utm_source || "")
      .trim()
      .slice(0, 100);

    await query(
      `INSERT INTO page_views (path, referrer_host, utm_source, visitor_id, device, country)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        path,
        referrerHost(req.body?.referrer, req.headers.host),
        utmSource || null,
        visitorId,
        deviceOf(userAgent),
        /^[A-Z]{2}$/.test(country) ? country : null,
      ]
    );
    res.status(204).end();
  })
);

// Date ranges offered in the dashboard: days covered and chart bucket size
const RANGES = {
  "7d": { days: 7, bucket: "day" },
  "30d": { days: 30, bucket: "day" },
  "90d": { days: 90, bucket: "week" },
  "12m": { days: 365, bucket: "month" },
};

// Friendly names for common referrers
const SOURCE_NAMES = [
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)facebook\.com$|^fb\.me$/, "Facebook"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
  [/(^|\.)whatsapp\.com$/, "WhatsApp"],
  [/(^|\.)pinterest\./, "Pinterest"],
];
const sourceName = (host) =>
  SOURCE_NAMES.find(([pattern]) => pattern.test(host))?.[1] || host;

const STATIC_PAGES = {
  "/": "Home",
  "/exhibitions": "Exhibitions",
  "/artists": "Artists",
  "/collection": "Collection",
  "/about": "About",
  "/contact": "Contact",
};

// Titles for /exhibition/…, /artist/… and /artwork/… paths
const pageTitles = async (paths) => {
  const titles = { ...STATIC_PAGES };
  const lookups = [
    ["exhibition", "exhibitions", "title"],
    ["artist", "artists", "name"],
    ["artwork", "artworks", "title"],
  ];
  for (const [prefix, table, column] of lookups) {
    const slugs = paths
      .filter((p) => p.startsWith(`/${prefix}/`))
      .map((p) => p.slice(prefix.length + 2));
    if (slugs.length === 0) continue;
    const { rows } = await query(
      `SELECT slug, ${column} AS title FROM ${table} WHERE slug = ANY($1)`,
      [slugs]
    );
    for (const row of rows) titles[`/${prefix}/${row.slug}`] = row.title.trim();
  }
  return titles;
};

// Dashboard data (admin only; mounted at /api/admin/analytics)
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const rangeKey = RANGES[req.query.range] ? req.query.range : "30d";
    const { days, bucket } = RANGES[rangeKey];

    // Whole days in the gallery's time zone, today included
    const period = `
      (now() AT TIME ZONE '${TIME_ZONE}')::date - ($1::int - 1) AS start_day,
      (now() AT TIME ZONE '${TIME_ZONE}')::date AS end_day`;
    const inRange = `(created_at AT TIME ZONE '${TIME_ZONE}')::date BETWEEN p.start_day AND p.end_day`;
    const inPrevious = `(created_at AT TIME ZONE '${TIME_ZONE}')::date
      BETWEEN p.start_day - $1::int AND p.start_day - 1`;

    const [
      totals,
      series,
      pages,
      sources,
      devices,
      countries,
      realtime,
      signups,
    ] = await Promise.all([
      // Views, and visitors counted per day (ids change daily)
      query(
        `WITH p AS (SELECT ${period}),
           daily AS (
             SELECT (created_at AT TIME ZONE '${TIME_ZONE}')::date AS day,
                    count(*) AS views, count(DISTINCT visitor_id) AS visitors,
                    ${inRange} AS current
             FROM page_views, p
             WHERE ${inRange} OR ${inPrevious}
             GROUP BY 1, 4
           )
           SELECT
             COALESCE(sum(views) FILTER (WHERE current), 0)::int AS views,
             COALESCE(sum(visitors) FILTER (WHERE current), 0)::int AS visitors,
             COALESCE(sum(views) FILTER (WHERE NOT current), 0)::int AS previous_views,
             COALESCE(sum(visitors) FILTER (WHERE NOT current), 0)::int AS previous_visitors
           FROM daily`,
        [days]
      ),
      query(
        `WITH p AS (SELECT ${period}),
           daily AS (
             SELECT (created_at AT TIME ZONE '${TIME_ZONE}')::date AS day,
                    count(*) AS views, count(DISTINCT visitor_id) AS visitors
             FROM page_views, p WHERE ${inRange} GROUP BY 1
           )
           SELECT date_trunc('${bucket}', d)::date::text AS date,
                  COALESCE(sum(views), 0)::int AS views,
                  COALESCE(sum(visitors), 0)::int AS visitors
           FROM p, generate_series(p.start_day, p.end_day, interval '1 day') AS d
           LEFT JOIN daily ON daily.day = d::date
           GROUP BY 1 ORDER BY 1`,
        [days]
      ),
      query(
        `WITH p AS (SELECT ${period})
           SELECT path, count(*)::int AS views, count(DISTINCT visitor_id)::int AS visitors
           FROM page_views, p WHERE ${inRange}
           GROUP BY path ORDER BY views DESC, path LIMIT 20`,
        [days]
      ),
      query(
        `WITH p AS (SELECT ${period})
           SELECT COALESCE(utm_source, referrer_host) AS source, count(*)::int AS views
           FROM page_views, p WHERE ${inRange}
           GROUP BY 1 ORDER BY views DESC`,
        [days]
      ),
      query(
        `WITH p AS (SELECT ${period})
           SELECT device, count(*)::int AS views
           FROM page_views, p WHERE ${inRange}
           GROUP BY device ORDER BY views DESC`,
        [days]
      ),
      query(
        `WITH p AS (SELECT ${period})
           SELECT country, count(*)::int AS views
           FROM page_views, p WHERE ${inRange} AND country IS NOT NULL
           GROUP BY country ORDER BY views DESC LIMIT 10`,
        [days]
      ),
      query(
        `SELECT count(DISTINCT visitor_id)::int AS visitors
           FROM page_views WHERE created_at > now() - interval '30 minutes'`
      ),
      query(
        `WITH p AS (SELECT ${period})
           SELECT count(*)::int AS signups
           FROM newsletter_subscribers, p
           WHERE (subscribed_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIME_ZONE}')::date
                 BETWEEN p.start_day AND p.end_day`,
        [days]
      ),
    ]);

    const titles = await pageTitles(pages.rows.map((r) => r.path));

    // Merge referrers that map to the same name (google.com, google.gr...)
    const bySource = new Map();
    for (const { source, views } of sources.rows) {
      const name = source ? sourceName(source) : "Direct";
      bySource.set(name, (bySource.get(name) || 0) + views);
    }

    res.json({
      range: rangeKey,
      bucket,
      totals: {
        ...totals.rows[0],
        newsletter_signups: signups.rows[0].signups,
        visitors_now: realtime.rows[0].visitors,
      },
      series: series.rows,
      pages: pages.rows.map((row) => ({
        ...row,
        title: titles[row.path] || row.path,
      })),
      sources: [...bySource]
        .map(([source, views]) => ({ source, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
      devices: devices.rows,
      countries: countries.rows,
    });
  })
);

module.exports = router;
