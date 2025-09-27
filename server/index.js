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
} = require("./config/middleware");
const { testConnection } = require("./config/database");

// Import middleware
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Import routes
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const exhibitionRoutes = require("./routes/exhibitions");
const artistRoutes = require("./routes/artists");
const artworkRoutes = require("./routes/artworks");
const pageRoutes = require("./routes/pages");
const newsletterRoutes = require("./routes/newsletter");
const fileRoutes = require("./routes/files");

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

// Admin API Routes (with authentication)
app.use("/api/admin/newsletter", newsletterRoutes);
app.use("/api/admin/exhibitions", exhibitionRoutes);
app.use("/api/admin/artists", artistRoutes);
app.use("/api/admin/artworks", artworkRoutes);
app.use("/api/admin/pages", pageRoutes);
app.use("/api/admin/files", fileRoutes);

// Serve React app for all other routes (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);
app.use(notFoundHandler);

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
