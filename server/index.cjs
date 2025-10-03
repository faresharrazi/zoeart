const express = require("express");
const path = require("path");

// Import configuration
const {
  cors,
  jsonParser,
  urlEncodedParser,
  requestTimeout,
  requestLogger,
  errorLogger,
} = require("./config/middleware.cjs");
const { testConnection } = require("./config/database.cjs");

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
const aboutBlocksRoutes = require("./routes/about-blocks.cjs");
const userRoutes = require("./routes/users.cjs");
const workingHoursRoutes = require("./routes/working-hours.cjs");
const articlesRoutes = require("./routes/articles.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection on startup
testConnection().then((connected) => {
  if (connected) {
    console.log("✅ Database connection established");
  } else {
    console.log("❌ Database connection failed");
  }
});

// Middleware
app.use(cors);
app.use(jsonParser);
app.use(urlEncodedParser);
app.use(requestTimeout(30000));
app.use(requestLogger);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

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
app.use("/api/about-blocks", aboutBlocksRoutes);
app.use("/api/admin/user", userRoutes);
app.use("/api/working-hours", workingHoursRoutes);
app.use("/api/articles", articlesRoutes);

// Admin API Routes (with authentication)
app.use("/api/admin/newsletter", newsletterRoutes);
app.use("/api/admin/exhibitions", exhibitionRoutes);
app.use("/api/admin/artists", artistRoutes);
app.use("/api/admin/artworks", artworkRoutes);
app.use("/api/admin/pages", pageRoutes);
app.use("/api/admin/contact-info", pageRoutes);
app.use("/api/admin/files", fileRoutes);
app.use("/api/admin/images", imageRoutes);
app.use("/api/admin/about-blocks", aboutBlocksRoutes);
app.use("/api/admin/working-hours", workingHoursRoutes);
app.use("/api/admin/articles", articlesRoutes);

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);
app.use(notFoundHandler);

// Serve React app for all other routes (SPA) - must be last
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal API Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
