const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Configure multer for file uploads (memory storage for Vercel)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (Vercel max is 50MB)
  },
  fileFilter: (req, file, cb) => {
    console.log(
      "File filter called for:",
      file.originalname,
      "MIME type:",
      file.mimetype
    );
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.log("File rejected - not an image");
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Database configuration
let pool = null;

function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error("Database connection string not found");
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Database query helper
async function query(sql, params = []) {
  try {
    const dbPool = getPool();
    const result = await dbPool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running",
    version: "2.0",
    features: ["file_upload", "admin_endpoints", "debugging"],
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await query(
      "SELECT NOW() as current_time, version() as postgres_version"
    );
    res.json({
      status: "OK",
      message: "Database connected successfully",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user in database
    const users = await query(
      "SELECT id, username, email, password_hash, role FROM users WHERE username = $1",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Test users endpoint
app.get("/api/test-users", async (req, res) => {
  try {
    const users = await query("SELECT id, username, email, role FROM users");
    res.json({
      status: "OK",
      message: "Users table check",
      users: users,
    });
  } catch (error) {
    console.error("Users check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Users check failed",
      error: error.message,
    });
  }
});

// Test page content endpoint
app.get("/api/test-page-content", async (req, res) => {
  try {
    const pageContent = await query(
      "SELECT * FROM page_content ORDER BY page_name"
    );
    res.json({
      status: "OK",
      message: "Page content table check",
      pageContent: pageContent,
    });
  } catch (error) {
    console.error("Page content check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Page content check failed",
      error: error.message,
    });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Get all exhibitions
app.get("/api/exhibitions", async (req, res) => {
  try {
    const exhibitions = await query(`
      SELECT * FROM exhibitions 
      WHERE is_visible = true 
      ORDER BY start_date DESC
    `);

    const formattedExhibitions = exhibitions.map((exhibition) => ({
      ...exhibition,
      featured_image: exhibition.featured_image
        ? exhibition.featured_image.startsWith("/api/file/")
          ? exhibition.featured_image
          : exhibition.featured_image.startsWith("blob:")
          ? `/api/file/${exhibition.featured_image.split("/").pop()}`
          : exhibition.featured_image &&
            exhibition.featured_image !== "undefined"
          ? `/api/file/${exhibition.featured_image}`
          : null
        : null,
      gallery_images:
        typeof exhibition.gallery_images === "string"
          ? JSON.parse(exhibition.gallery_images || "[]")
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null)
          : (exhibition.gallery_images || [])
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null),
      assigned_artists:
        typeof exhibition.assigned_artists === "string"
          ? JSON.parse(exhibition.assigned_artists || "[]")
          : exhibition.assigned_artists || [],
      assigned_artworks:
        typeof exhibition.assigned_artworks === "string"
          ? JSON.parse(exhibition.assigned_artworks || "[]")
          : exhibition.assigned_artworks || [],
    }));

    res.json(formattedExhibitions);
  } catch (error) {
    console.error("Error fetching exhibitions:", error);
    res.status(500).json({ error: "Failed to fetch exhibitions" });
  }
});

// Get all artists
app.get("/api/artists", async (req, res) => {
  try {
    const artists = await query(`
      SELECT * FROM artists 
      WHERE is_visible = true 
      ORDER BY name ASC
    `);

    const formattedArtists = artists.map((artist) => ({
      ...artist,
      profile_image: artist.profile_image
        ? artist.profile_image.startsWith("/api/file/")
          ? artist.profile_image
          : artist.profile_image.startsWith("blob:")
          ? `/api/file/${artist.profile_image.split("/").pop()}`
          : artist.profile_image && artist.profile_image !== "undefined"
          ? `/api/file/${artist.profile_image}`
          : null
        : null,
      social_media:
        typeof artist.social_media === "string"
          ? JSON.parse(artist.social_media || "{}")
          : artist.social_media || {},
      assigned_artworks:
        typeof artist.assigned_artworks === "string"
          ? JSON.parse(artist.assigned_artworks || "[]")
          : artist.assigned_artworks || [],
    }));

    res.json(formattedArtists);
  } catch (error) {
    console.error("Error fetching artists:", error);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

// Get all artworks
app.get("/api/artworks", async (req, res) => {
  try {
    const artworks = await query(`
      SELECT a.*, ar.name as artist_name 
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.is_visible = true 
      ORDER BY a.created_at DESC
    `);

    const formattedArtworks = artworks.map((artwork) => ({
      ...artwork,
      images: artwork.images
        ? typeof artwork.images === "string"
          ? JSON.parse(artwork.images || "[]")
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null)
          : (artwork.images || [])
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null)
        : [],
    }));

    res.json(formattedArtworks);
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

// Get page content
app.get("/api/page-content", async (req, res) => {
  try {
    console.log("Fetching page content...");
    const pages = await query("SELECT * FROM page_content");
    const contactInfo = await query("SELECT * FROM contact_info");

    console.log("Pages found:", pages.length);
    console.log("Contact info found:", contactInfo.length);
    console.log(
      "Raw pages data:",
      pages.map((p) => ({
        page_name: p.page_name,
        is_visible: p.is_visible,
        type: typeof p.is_visible,
      }))
    );

    const pageData = pages.reduce((acc, page) => {
      try {
        acc[page.page_name] = {
          ...page,
          isVisible: Boolean(page.is_visible), // Convert integer to boolean
          content:
            typeof page.content === "string"
              ? JSON.parse(page.content || "{}")
              : page.content || {},
        };
      } catch (e) {
        console.error("Error parsing page content for", page.page_name, e);
        acc[page.page_name] = {
          ...page,
          isVisible: Boolean(page.is_visible), // Convert integer to boolean
          content: {},
        };
      }
      return acc;
    }, {});

    const response = {
      pages: pageData,
      contactInfo: contactInfo.length > 0 ? contactInfo[0] : {},
    };

    console.log("Page data keys:", Object.keys(pageData));
    console.log("Response structure:", {
      hasPages: !!response.pages,
      hasHome: !!response.pages.home,
      hasContactInfo: !!response.contactInfo,
      keys: Object.keys(response),
    });

    res.json(response);
  } catch (error) {
    console.error("Error fetching page content:", error);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

// Get newsletter subscribers
app.get("/api/newsletter", authenticateToken, async (req, res) => {
  try {
    const subscribers = await query(`
      SELECT id, email, name, subscribed_at, status 
      FROM newsletter_subscribers 
      ORDER BY subscribed_at DESC
    `);
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    res.status(500).json({ error: "Failed to fetch newsletter subscribers" });
  }
});

// Admin newsletter endpoint (for admin panel)
app.get("/api/admin/newsletter", authenticateToken, async (req, res) => {
  try {
    const subscribers = await query(`
      SELECT id, email, name, subscribed_at, status 
      FROM newsletter_subscribers 
      ORDER BY subscribed_at DESC
    `);
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    res.status(500).json({ error: "Failed to fetch newsletter subscribers" });
  }
});

// Newsletter subscription
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email already exists
    const existing = await query(
      "SELECT id FROM newsletter_subscribers WHERE email = $1",
      [email]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: "Already subscribed" });
    }

    // Add new subscriber
    await query(
      `
      INSERT INTO newsletter_subscribers (email, name, source, status, subscribed_at)
      VALUES ($1, $2, $3, $4, NOW())
    `,
      [email, name || null, "website", "active"]
    );

    res.json({ success: true, message: "Successfully subscribed" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ error: "Failed to subscribe to newsletter" });
  }
});

// Update page content
app.put("/api/page-content/:pageName", authenticateToken, async (req, res) => {
  try {
    const { pageName } = req.params;
    const { title, description, content, isVisible } = req.body;

    console.log("Updating page content for:", pageName);
    console.log("Update data:", { title, description, content, isVisible });

    // Get current page data
    const currentPage = await query(
      "SELECT * FROM page_content WHERE page_name = $1",
      [pageName]
    );

    if (currentPage.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title || null);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description || null);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(content ? JSON.stringify(content) : null);
      paramIndex++;
    }

    if (isVisible !== undefined) {
      updates.push(`is_visible = $${paramIndex}`);
      values.push(isVisible ? 1 : 0);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: "No changes to update" });
    }

    values.push(pageName);

    const updateQuery = `UPDATE page_content SET ${updates.join(
      ", "
    )} WHERE page_name = $${paramIndex}`;

    console.log("Update query:", updateQuery);
    console.log("Values:", values);

    await query(updateQuery, values);

    res.json({ success: true, message: "Page content updated successfully" });
  } catch (error) {
    console.error("Error updating page content:", error);
    res.status(500).json({ error: "Failed to update page content" });
  }
});

// Admin page content update endpoint
app.put(
  "/api/admin/page-content/:pageName",
  authenticateToken,
  async (req, res) => {
    try {
      const { pageName } = req.params;
      const { title, description, content, isVisible } = req.body;

      console.log("=== ADMIN PAGE CONTENT UPDATE ===");
      console.log("Page name:", pageName);
      console.log("Update data:", { title, description, content, isVisible });
      console.log("Request headers:", req.headers);
      console.log("isVisible type:", typeof isVisible, "value:", isVisible);

      // Get current page data
      const currentPage = await query(
        "SELECT * FROM page_content WHERE page_name = $1",
        [pageName]
      );

      console.log("Current page data:", currentPage);

      if (currentPage.length === 0) {
        console.log("Page not found in database");
        return res.status(404).json({ error: "Page not found" });
      }

      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(title || null);
        paramIndex++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(description || null);
        paramIndex++;
      }

      if (content !== undefined) {
        updates.push(`content = $${paramIndex}`);
        values.push(content ? JSON.stringify(content) : null);
        paramIndex++;
      }

      if (isVisible !== undefined) {
        updates.push(`is_visible = $${paramIndex}`);
        values.push(isVisible ? 1 : 0);
        paramIndex++;
      }

      if (updates.length === 0) {
        console.log("No changes to update");
        return res.json({ success: true, message: "No changes to update" });
      }

      values.push(pageName);

      const updateQuery = `UPDATE page_content SET ${updates.join(
        ", "
      )} WHERE page_name = $${paramIndex}`;

      console.log("Admin update query:", updateQuery);
      console.log("Values:", values);

      const result = await query(updateQuery, values);
      console.log("Database update result:", result);

      // Verify the update by fetching the updated data
      const updatedPage = await query(
        "SELECT * FROM page_content WHERE page_name = $1",
        [pageName]
      );
      console.log("Updated page data:", updatedPage);

      res.json({ success: true, message: "Page content updated successfully" });
    } catch (error) {
      console.error("Error updating page content:", error);
      res.status(500).json({ error: "Failed to update page content" });
    }
  }
);

// Update contact info
app.put("/api/contact-info", authenticateToken, async (req, res) => {
  try {
    const { email, phone, instagram, address } = req.body;

    // Check if contact info exists
    const existing = await query("SELECT id FROM contact_info LIMIT 1");

    if (existing.length > 0) {
      await query(
        "UPDATE contact_info SET email = $1, phone = $2, instagram = $3, address = $4 WHERE id = $5",
        [email, phone, instagram, address, existing[0].id]
      );
    } else {
      await query(
        "INSERT INTO contact_info (email, phone, instagram, address) VALUES ($1, $2, $3, $4)",
        [email, phone, instagram, address]
      );
    }

    res.json({ success: true, message: "Contact info updated successfully" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Failed to update contact info" });
  }
});

// Update home settings
app.put("/api/admin/home-settings", authenticateToken, async (req, res) => {
  try {
    const { title, description, content, heroImages, heroImageIds } = req.body;

    console.log("=== ADMIN HOME SETTINGS UPDATE ===");
    console.log("Update data:", {
      title,
      description,
      content,
      heroImages,
      heroImageIds,
    });
    console.log("Request headers:", req.headers);

    // Get current home page data
    const currentSettings = await query(
      "SELECT * FROM page_content WHERE page_name = 'home'"
    );

    console.log("Current home settings:", currentSettings);

    if (currentSettings.length === 0) {
      console.log("Home page not found in database");
      return res.status(404).json({ error: "Home page not found" });
    }

    // Merge with existing content
    const currentContent =
      typeof currentSettings[0].content === "string"
        ? JSON.parse(currentSettings[0].content || "{}")
        : currentSettings[0].content || {};
    const updatedContent = {
      ...currentContent,
      ...content,
      heroImages: heroImages || [],
      heroImageIds: heroImageIds || [],
    };

    console.log("Current content:", currentContent);
    console.log("Updated content:", updatedContent);

    // Update home settings
    const result = await query(
      "UPDATE page_content SET title = $1, description = $2, content = $3 WHERE page_name = 'home'",
      [title, description, JSON.stringify(updatedContent)]
    );

    console.log("Update result:", result);

    // Verify the update
    const updatedSettings = await query(
      "SELECT * FROM page_content WHERE page_name = 'home'"
    );
    console.log("Updated home settings:", updatedSettings);

    res.json({ success: true, message: "Home settings updated successfully" });
  } catch (error) {
    console.error("Error updating home settings:", error);
    res.status(500).json({ error: "Failed to update home settings" });
  }
});

// Update contact info (admin endpoint)
app.put("/api/admin/contact-info", authenticateToken, async (req, res) => {
  try {
    const { email, phone, instagram, address } = req.body;

    console.log("=== ADMIN CONTACT INFO UPDATE ===");
    console.log("Update data:", { email, phone, instagram, address });
    console.log("Request headers:", req.headers);

    // Check if contact info exists
    const existing = await query("SELECT id FROM contact_info LIMIT 1");
    console.log("Existing contact info:", existing);

    if (existing.length > 0) {
      console.log("Updating existing contact info");
      const result = await query(
        "UPDATE contact_info SET email = $1, phone = $2, instagram = $3, address = $4 WHERE id = $5",
        [email, phone, instagram, address, existing[0].id]
      );
      console.log("Update result:", result);
    } else {
      console.log("Creating new contact info");
      const result = await query(
        "INSERT INTO contact_info (email, phone, instagram, address) VALUES ($1, $2, $3, $4)",
        [email, phone, instagram, address]
      );
      console.log("Insert result:", result);
    }

    // Verify the update
    const updatedContactInfo = await query(
      "SELECT * FROM contact_info LIMIT 1"
    );
    console.log("Updated contact info:", updatedContactInfo);

    res.json({ success: true, message: "Contact info updated successfully" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Failed to update contact info" });
  }
});

// Get hero images (public endpoint)
app.get("/api/hero-images", async (req, res) => {
  try {
    console.log("Fetching hero images...");
    const files = await query(
      "SELECT * FROM uploaded_files WHERE category = 'hero_image' ORDER BY created_at DESC"
    );
    console.log("Hero images found:", files.length);
    console.log(
      "Hero images data:",
      files.map((f) => ({
        id: f.id,
        originalName: f.original_name,
        filename: f.filename,
        mimeType: f.mime_type,
        hasFileData: !!f.file_data,
      }))
    );
    res.json(files);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    res.status(500).json({ error: "Failed to fetch hero images" });
  }
});

// Serve uploaded files from database
app.get("/api/file/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Serving file with ID:", id);

    // The ID parameter can be either:
    // 1. A database ID (integer) - for backward compatibility
    // 2. A UUID filename - for new files
    // 3. A UUID extracted from a blob URL

    let files;

    // First, try to query by filename (UUID) if it looks like a UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      console.log("Querying by filename (UUID):", id);
      files = await query(
        "SELECT * FROM uploaded_files WHERE filename LIKE $1",
        [`%${id}%`]
      );
    } else {
      // Try to query by database ID (integer)
      console.log("Querying by database ID:", id);
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        console.log("Invalid ID format:", id);
        return res.status(400).json({ error: "Invalid file ID format" });
      }
      files = await query("SELECT * FROM uploaded_files WHERE id = $1", [
        numericId,
      ]);
    }

    console.log("Found files:", files.length);

    if (files.length === 0) {
      console.log("File not found for ID:", id);
      return res.status(404).json({
        error: "File not found",
        message:
          "This file may have been uploaded using the old system and needs to be re-uploaded",
      });
    }

    const file = files[0];
    console.log("File details:", {
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      mimeType: file.mime_type,
      fileSize: file.file_size,
      hasFileData: !!file.file_data,
    });

    // Check if file_data exists
    if (!file.file_data) {
      console.log("File data is null for file ID:", id);
      return res.status(404).json({
        error: "File data not available",
        message:
          "This file was uploaded before the database migration and needs to be re-uploaded",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Length", file.file_size);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.original_name}"`
    );

    // Send the binary data directly from database
    res.send(file.file_data);
  } catch (error) {
    console.error("Error serving file:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to serve file",
      message: "An internal server error occurred while serving the file",
    });
  }
});

// Admin user management endpoints
app.get("/api/admin/user", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching users...");
    const users = await query(`
      SELECT id, username, email, role, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    console.log("Found users:", users.length);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.put("/api/admin/user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, currentPassword } = req.body;

    console.log("Updating user:", {
      id,
      username,
      email,
      hasPassword: !!password,
    });

    // Verify current password if changing password
    if (password) {
      const users = await query(
        "SELECT password_hash FROM users WHERE id = $1",
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        users[0].password_hash
      );
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (username) {
      updates.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }

    if (email) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(
        ", "
      )}, updated_at = NOW() WHERE id = $${paramIndex}`,
      values
    );

    console.log("User updated successfully");
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// File upload endpoints
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("=== FILE UPLOAD ===");
      console.log("Request body:", req.body);
      console.log("Request file:", req.file ? "File present" : "No file");
      console.log("Request headers:", req.headers);

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { category, uploadedBy } = req.body;
      const finalCategory = category || "general";

      console.log("File details:", {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        category: finalCategory,
      });

      // Generate a unique filename
      const uniqueFilename = `${crypto.randomUUID()}-${req.file.originalname}`;
      const filePath = `uploads/${finalCategory}/${uniqueFilename}`;

      console.log("Generated filename:", uniqueFilename);

      // Store binary file data directly in PostgreSQL database
      const fileBuffer = req.file.buffer;

      // Save file info to database with binary data
      const result = await query(
        `INSERT INTO uploaded_files (original_name, filename, file_path, file_size, mime_type, category, uploaded_by, file_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          req.file.originalname,
          uniqueFilename,
          filePath,
          req.file.size,
          req.file.mimetype,
          finalCategory,
          uploadedBy || null,
          fileBuffer, // Store binary data directly
        ]
      );

      console.log("Database insert result:", result);

      const response = {
        success: true,
        file: {
          id: result[0].id,
          originalName: req.file.originalname,
          filename: uniqueFilename,
          filePath: filePath,
          url: `/api/file/${result[0].id}`, // Use API endpoint to serve files
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
      };

      console.log("Upload response:", response);
      res.json(response);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  }
);

// Get uploaded files (admin only)
app.get("/api/files", authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;

    let queryStr = "SELECT * FROM uploaded_files";
    let params = [];

    if (category) {
      queryStr += " WHERE category = $1";
      params.push(category);
    }

    queryStr += " ORDER BY created_at DESC";

    const files = await query(queryStr, params);
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Delete uploaded file
app.delete("/api/files/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info first
    const files = await query("SELECT * FROM uploaded_files WHERE id = $1", [
      id,
    ]);
    if (files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = files[0];

    // Delete file from filesystem
    try {
      fs.unlinkSync(file.file_path);
    } catch (fsError) {
      console.warn("Could not delete file from filesystem:", fsError.message);
    }

    // Delete file record from database
    await query("DELETE FROM uploaded_files WHERE id = $1", [id]);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Get user info
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const users = await query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user info
app.put("/api/user", authenticateToken, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = $1");
      values.push(username);
    }

    if (email) {
      updates.push("email = $2");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password_hash = $3");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: "No changes to update" });
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(
        ", "
      )}, updated_at = NOW() WHERE id = $4`,
      values
    );

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete newsletter subscriber
app.delete("/api/newsletter/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM newsletter_subscribers WHERE id = $1", [id]);
    res.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Error deleting newsletter subscriber:", error);
    res.status(500).json({ error: "Failed to delete newsletter subscriber" });
  }
});

// Admin endpoints for CRUD operations
// Get all exhibitions (admin)
app.get("/api/admin/exhibitions", authenticateToken, async (req, res) => {
  try {
    const exhibitions = await query(`
      SELECT * FROM exhibitions 
      ORDER BY start_date DESC
    `);

    const formattedExhibitions = exhibitions.map((exhibition) => ({
      ...exhibition,
      featured_image: exhibition.featured_image
        ? exhibition.featured_image.startsWith("/api/file/")
          ? exhibition.featured_image
          : exhibition.featured_image.startsWith("blob:")
          ? `/api/file/${exhibition.featured_image.split("/").pop()}`
          : exhibition.featured_image &&
            exhibition.featured_image !== "undefined"
          ? `/api/file/${exhibition.featured_image}`
          : null
        : null,
      gallery_images:
        typeof exhibition.gallery_images === "string"
          ? JSON.parse(exhibition.gallery_images || "[]")
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null)
          : (exhibition.gallery_images || [])
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null),
      assigned_artists:
        typeof exhibition.assigned_artists === "string"
          ? JSON.parse(exhibition.assigned_artists || "[]")
          : exhibition.assigned_artists || [],
      assigned_artworks:
        typeof exhibition.assigned_artworks === "string"
          ? JSON.parse(exhibition.assigned_artworks || "[]")
          : exhibition.assigned_artworks || [],
    }));

    res.json(formattedExhibitions);
  } catch (error) {
    console.error("Error fetching exhibitions:", error);
    res.status(500).json({ error: "Failed to fetch exhibitions" });
  }
});

// Get all artists (admin)
app.get("/api/admin/artists", authenticateToken, async (req, res) => {
  try {
    const artists = await query(`
      SELECT * FROM artists 
      ORDER BY name ASC
    `);

    const formattedArtists = artists.map((artist) => ({
      ...artist,
      profile_image: artist.profile_image
        ? artist.profile_image.startsWith("/api/file/")
          ? artist.profile_image
          : artist.profile_image.startsWith("blob:")
          ? `/api/file/${artist.profile_image.split("/").pop()}`
          : artist.profile_image && artist.profile_image !== "undefined"
          ? `/api/file/${artist.profile_image}`
          : null
        : null,
      social_media:
        typeof artist.social_media === "string"
          ? JSON.parse(artist.social_media || "{}")
          : artist.social_media || {},
      assigned_artworks:
        typeof artist.assigned_artworks === "string"
          ? JSON.parse(artist.assigned_artworks || "[]")
          : artist.assigned_artworks || [],
    }));

    res.json(formattedArtists);
  } catch (error) {
    console.error("Error fetching artists:", error);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

// Get all artworks (admin)
app.get("/api/admin/artworks", authenticateToken, async (req, res) => {
  try {
    const artworks = await query(`
      SELECT a.*, ar.name as artist_name 
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      ORDER BY a.created_at DESC
    `);

    const formattedArtworks = artworks.map((artwork) => ({
      ...artwork,
      images: artwork.images
        ? typeof artwork.images === "string"
          ? JSON.parse(artwork.images || "[]")
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null)
          : (artwork.images || [])
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null)
        : [],
    }));

    res.json(formattedArtworks);
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

// Create exhibition
app.post("/api/admin/exhibitions", authenticateToken, async (req, res) => {
  try {
    console.log("=== CREATING EXHIBITION ===");
    console.log("Request body:", req.body);

    const {
      title,
      slug,
      description,
      start_date,
      end_date,
      location,
      curator,
      status,
      featured_image,
      gallery_images,
      assigned_artists,
      assigned_artworks,
      call_for_artists,
      cta_link,
      is_visible = true,
    } = req.body;

    console.log("Extracted fields:", {
      title,
      slug,
      description,
      start_date,
      end_date,
      location,
      curator,
      status,
      featured_image,
      gallery_images,
      assigned_artists,
      assigned_artworks,
      call_for_artists,
      cta_link,
      is_visible,
    });

    // Validate required fields
    if (!title || !slug) {
      console.error("Missing required fields:", { title, slug });
      return res.status(400).json({ error: "Title and slug are required" });
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const result = await query(
      `
      INSERT INTO exhibitions (title, slug, description, start_date, end_date, location, curator, status, featured_image, gallery_images, assigned_artists, assigned_artworks, call_for_artists, cta_link, is_visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `,
      [
        title,
        finalSlug,
        description,
        start_date,
        end_date,
        location,
        curator,
        status,
        featured_image,
        JSON.stringify(gallery_images || []),
        JSON.stringify(assigned_artists || []),
        JSON.stringify(assigned_artworks || []),
        call_for_artists || false,
        cta_link,
        is_visible !== false,
      ]
    );

    console.log("Exhibition created successfully:", result);
    res.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error creating exhibition:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to create exhibition" });
  }
});

// Toggle exhibition visibility
app.patch(
  "/api/admin/exhibitions/:id/visibility",
  authenticateToken,
  async (req, res) => {
    try {
      console.log("=== TOGGLING EXHIBITION VISIBILITY ===");
      console.log("Exhibition ID:", req.params.id);
      console.log("Request body:", req.body);

      const { id } = req.params;
      const { is_visible } = req.body;

      console.log("Setting visibility to:", is_visible);

      await query(
        `UPDATE exhibitions SET is_visible = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [is_visible !== false, id]
      );

      console.log("Exhibition visibility updated successfully");
      res.json({
        success: true,
        message: "Exhibition visibility updated successfully",
      });
    } catch (error) {
      console.error("Error updating exhibition visibility:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Failed to update exhibition visibility" });
    }
  }
);

// Update exhibition
app.put("/api/admin/exhibitions/:id", authenticateToken, async (req, res) => {
  try {
    console.log("=== UPDATING EXHIBITION ===");
    console.log("Exhibition ID:", req.params.id);
    console.log("Request body:", req.body);

    const { id } = req.params;
    const {
      title,
      slug,
      description,
      start_date,
      end_date,
      location,
      curator,
      status,
      featured_image,
      gallery_images,
      assigned_artists,
      assigned_artworks,
      call_for_artists,
      cta_link,
      is_visible,
    } = req.body;

    console.log("Extracted fields:", {
      title,
      slug,
      description,
      start_date,
      end_date,
      location,
      curator,
      status,
      featured_image,
      gallery_images,
      assigned_artists,
      assigned_artworks,
      call_for_artists,
      cta_link,
      is_visible,
    });

    await query(
      `
      UPDATE exhibitions 
      SET title = $1, slug = $2, description = $3, start_date = $4, end_date = $5, location = $6, curator = $7, status = $8, featured_image = $9, gallery_images = $10, assigned_artists = $11, assigned_artworks = $12, call_for_artists = $13, cta_link = $14, is_visible = $15, updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
    `,
      [
        title,
        slug,
        description,
        start_date,
        end_date,
        location,
        curator,
        status,
        featured_image,
        JSON.stringify(gallery_images || []),
        JSON.stringify(assigned_artists || []),
        JSON.stringify(assigned_artworks || []),
        call_for_artists || false,
        cta_link,
        is_visible !== false,
        id,
      ]
    );

    console.log("Exhibition updated successfully");
    res.json({ success: true, message: "Exhibition updated successfully" });
  } catch (error) {
    console.error("Error updating exhibition:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to update exhibition" });
  }
});

// Delete exhibition
app.delete(
  "/api/admin/exhibitions/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      await query("DELETE FROM exhibitions WHERE id = $1", [id]);
      res.json({ success: true, message: "Exhibition deleted successfully" });
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      res.status(500).json({ error: "Failed to delete exhibition" });
    }
  }
);

// Create artist
app.post("/api/admin/artists", authenticateToken, async (req, res) => {
  try {
    console.log("=== CREATE ARTIST ===");
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);

    const {
      name,
      slug,
      specialty,
      bio,
      profile_image,
      social_media,
      is_visible = true,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Generate slug if not provided
    const artistSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    console.log("Artist data:", {
      name,
      slug: artistSlug,
      specialty,
      bio,
      profile_image,
      social_media,
      is_visible,
    });

    const result = await query(
      `
      INSERT INTO artists (name, slug, specialty, bio, profile_image, social_media, is_visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        name,
        artistSlug,
        specialty || null,
        bio || null,
        profile_image || null,
        JSON.stringify(social_media || {}),
        is_visible !== false, // Convert to boolean
      ]
    );

    console.log("Artist created with ID:", result[0].id);
    res.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error creating artist:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to create artist" });
  }
});

// Update artist
app.put("/api/admin/artists/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      specialty,
      bio,
      profile_image,
      social_media,
      is_visible,
    } = req.body;

    // Get current artist data first
    const currentArtist = await query("SELECT * FROM artists WHERE id = $1", [
      id,
    ]);
    if (currentArtist.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const artist = currentArtist[0];

    // Use provided values or fall back to current values
    const updatedName = name || artist.name;
    const updatedSlug =
      slug ||
      artist.slug ||
      updatedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const updatedSpecialty =
      specialty !== undefined ? specialty : artist.specialty;
    const updatedBio = bio !== undefined ? bio : artist.bio;
    const updatedProfileImage =
      profile_image !== undefined ? profile_image : artist.profile_image;
    const updatedSocialMedia =
      social_media !== undefined ? social_media : artist.social_media;
    const updatedIsVisible =
      is_visible !== undefined ? is_visible : artist.is_visible;

    await query(
      `
      UPDATE artists 
      SET name = $1, slug = $2, specialty = $3, bio = $4, profile_image = $5, social_media = $6, is_visible = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `,
      [
        updatedName,
        updatedSlug,
        updatedSpecialty || null,
        updatedBio || null,
        updatedProfileImage || null,
        JSON.stringify(updatedSocialMedia || {}),
        updatedIsVisible !== false, // Convert to boolean
        id,
      ]
    );

    res.json({ success: true, message: "Artist updated successfully" });
  } catch (error) {
    console.error("Error updating artist:", error);
    res.status(500).json({ error: "Failed to update artist" });
  }
});

// Delete artist
app.delete("/api/admin/artists/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM artists WHERE id = $1", [id]);
    res.json({ success: true, message: "Artist deleted successfully" });
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).json({ error: "Failed to delete artist" });
  }
});

// Create artwork
app.post("/api/admin/artworks", authenticateToken, async (req, res) => {
  try {
    console.log("=== CREATE ARTWORK ===");
    console.log("Request body:", req.body);

    const {
      title,
      slug,
      artist_id,
      year,
      medium,
      size,
      description,
      images,
      is_visible = true,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Generate slug if not provided
    const artworkSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    console.log("Artwork data:", {
      title,
      slug: artworkSlug,
      artist_id,
      year,
      medium,
      size,
      description,
      images,
      is_visible,
    });

    const result = await query(
      `
      INSERT INTO artworks (title, slug, artist_id, year, medium, size, description, images, is_visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `,
      [
        title,
        artworkSlug,
        artist_id || null,
        year || null,
        medium || null,
        size || null,
        description || null,
        JSON.stringify(images || []),
        is_visible !== false, // Convert to boolean
      ]
    );

    console.log("Artwork created with ID:", result[0].id);
    res.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error creating artwork:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to create artwork" });
  }
});

// Update artwork
app.put("/api/admin/artworks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      artist_id,
      year,
      medium,
      size,
      description,
      images,
      is_visible,
    } = req.body;

    // Get current artwork data first
    const currentArtwork = await query("SELECT * FROM artworks WHERE id = $1", [
      id,
    ]);
    if (currentArtwork.length === 0) {
      return res.status(404).json({ error: "Artwork not found" });
    }

    const artwork = currentArtwork[0];

    // Use provided values or fall back to current values
    const updatedTitle = title || artwork.title;
    const updatedSlug =
      slug ||
      artwork.slug ||
      updatedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const updatedArtistId =
      artist_id !== undefined ? artist_id : artwork.artist_id;
    const updatedYear = year !== undefined ? year : artwork.year;
    const updatedMedium = medium !== undefined ? medium : artwork.medium;
    const updatedSize = size !== undefined ? size : artwork.size;
    const updatedDescription =
      description !== undefined ? description : artwork.description;
    const updatedImages = images !== undefined ? images : artwork.images;
    const updatedIsVisible =
      is_visible !== undefined ? is_visible : artwork.is_visible;

    await query(
      `
      UPDATE artworks 
      SET title = $1, slug = $2, artist_id = $3, year = $4, medium = $5, size = $6, description = $7, images = $8, is_visible = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `,
      [
        updatedTitle,
        updatedSlug,
        updatedArtistId || null,
        updatedYear || null,
        updatedMedium || null,
        updatedSize || null,
        updatedDescription || null,
        JSON.stringify(updatedImages || []),
        updatedIsVisible !== false, // Convert to boolean
        id,
      ]
    );

    res.json({ success: true, message: "Artwork updated successfully" });
  } catch (error) {
    console.error("Error updating artwork:", error);
    res.status(500).json({ error: "Failed to update artwork" });
  }
});

// Delete artwork
app.delete("/api/admin/artworks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM artworks WHERE id = $1", [id]);
    res.json({ success: true, message: "Artwork deleted successfully" });
  } catch (error) {
    console.error("Error deleting artwork:", error);
    res.status(500).json({ error: "Failed to delete artwork" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal API Server running on port ${PORT}`);
});

module.exports = app;
