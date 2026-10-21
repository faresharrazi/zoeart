require("dotenv").config({ path: [".env.local", ".env"], quiet: true });

const express = require("express");

// Import configuration
const {
  cors,
  jsonParser,
  urlEncodedParser,
} = require("./config/middleware.cjs");
const { testConnection } = require("./config/database.cjs");
const { authenticateToken } = require("./middleware/auth.cjs");

// Import middleware
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler.cjs");

// Import routes
const healthRoutes = require("./routes/health.cjs");
const authRoutes = require("./routes/auth.cjs");
const exhibitionRoutes = require("./routes/exhibitions.cjs");
const artistRoutes = require("./routes/artists.cjs");
const artworkRoutes = require("./routes/artworks.cjs");
const pageRoutes = require("./routes/pages.cjs");
const newsletterRoutes = require("./routes/newsletter.cjs");
const fileRoutes = require("./routes/files.cjs");
const imageRoutes = require("./routes/images.cjs");
const heroImageRoutes = require("./routes/hero-images.cjs");
const aboutBlocksRoutes = require("./routes/about-blocks.cjs");
const userRoutes = require("./routes/users.cjs");
const workingHoursRoutes = require("./routes/working-hours.cjs");
const articlesRoutes = require("./routes/articles.cjs");
const seoRoutes = require("./routes/seo.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection on startup
testConnection().then((connected) => {
  if (!connected) {
    console.error("Database connection failed");
  }
});

// Middleware
app.use(cors);
app.use(jsonParser);
app.use(urlEncodedParser);

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exhibitions", exhibitionRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/page-content", pageRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/hero-images", heroImageRoutes);
app.use("/api/about-blocks", aboutBlocksRoutes);
app.use("/api/working-hours", workingHoursRoutes);
app.use("/api/articles", articlesRoutes);

// Admin API Routes. Everything under /api/admin requires a valid login;
// routers check req.isAdminRequest to include hidden or unpublished content.
app.use("/api/admin", authenticateToken, (req, res, next) => {
  req.isAdminRequest = true;
  next();
});
app.use("/api/admin/user", userRoutes);
app.use("/api/admin/newsletter", newsletterRoutes);
app.use("/api/admin/exhibitions", exhibitionRoutes);
app.use("/api/admin/artists", artistRoutes);
app.use("/api/admin/artworks", artworkRoutes);
app.use("/api/admin/pages", pageRoutes);
app.use("/api/admin/files", fileRoutes);
app.use("/api/admin/images", imageRoutes);
app.use("/api/admin/hero-images", heroImageRoutes);
app.use("/api/admin/about-blocks", aboutBlocksRoutes);
app.use("/api/admin/working-hours", workingHoursRoutes);
app.use("/api/admin/articles", articlesRoutes);

// Sitemap and link-preview pages for social networks (see routes/seo.cjs)
app.use(seoRoutes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Start a standalone server when run directly (local dev). On Vercel the
// exported app is used as the serverless handler instead.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}/api`);
  });
}

module.exports = app;
