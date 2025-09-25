const express = require("express");
const cors = require("cors");
const path = require("path");
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For now, use a default category and handle it in the upload endpoint
    const uploadPath = `uploads/temp`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Database configuration for Supabase (PostgreSQL)
let pool = null;

function getPool() {
  if (!pool) {
    console.log("Environment variables check:");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
    console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "Set" : "Not set");
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // Try DATABASE_URL first, then POSTGRES_URL
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      console.error("No database connection string found!");
      throw new Error("Database connection string not found");
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

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

// Database query helper for PostgreSQL
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

// Serve static files from the 'dist' directory (frontend build)
app.use(express.static(path.join(__dirname, "dist")));

// API Routes

// Authentication endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt:", { username, password: password ? "provided" : "missing" });

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

    console.log("Found users:", users.length);

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
      gallery_images:
        typeof exhibition.gallery_images === "string"
          ? JSON.parse(exhibition.gallery_images || "[]")
          : exhibition.gallery_images || [],
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

// Get exhibition by ID
app.get("/api/exhibitions/:id", async (req, res) => {
  try {
    const exhibitions = await query(
      `SELECT * FROM exhibitions WHERE id = $1 AND is_visible = true`,
      [req.params.id]
    );
    
    if (exhibitions.length === 0) {
      return res.status(404).json({ error: "Exhibition not found" });
    }
    
    const exhibition = exhibitions[0];
    const formattedExhibition = {
      ...exhibition,
      gallery_images: JSON.parse(exhibition.gallery_images || "[]"),
      assigned_artists: JSON.parse(exhibition.assigned_artists || "[]"),
      assigned_artworks: JSON.parse(exhibition.assigned_artworks || "[]"),
    };
    
    res.json(formattedExhibition);
  } catch (error) {
    console.error("Error fetching exhibition:", error);
    res.status(500).json({ error: "Failed to fetch exhibition" });
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

// Get artist by ID
app.get("/api/artists/:id", async (req, res) => {
  try {
    const artists = await query(
      `SELECT * FROM artists WHERE id = $9 AND is_visible = true`,
      [req.params.id]
    );
    
    if (artists.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }
    
    const artist = artists[0];
    const formattedArtist = {
      ...artist,
      social_media: JSON.parse(artist.social_media || "{}"),
      assigned_artworks: JSON.parse(artist.assigned_artworks || "[]"),
    };
    
    res.json(formattedArtist);
  } catch (error) {
    console.error("Error fetching artist:", error);
    res.status(500).json({ error: "Failed to fetch artist" });
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
      images:
        typeof artwork.images === "string"
          ? JSON.parse(artwork.images || "[]")
          : artwork.images || [],
    }));
    
    res.json(formattedArtworks);
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

// Get artwork by ID
app.get("/api/artworks/:id", async (req, res) => {
  try {
    const artworks = await query(
      `
      SELECT a.*, ar.name as artist_name
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id = $11 AND a.is_visible = true
    `,
      [req.params.id]
    );
    
    if (artworks.length === 0) {
      return res.status(404).json({ error: "Artwork not found" });
    }
    
    const artwork = artworks[0];
    const formattedArtwork = {
      ...artwork,
      images: JSON.parse(artwork.images || "[]"),
    };
    
    res.json(formattedArtwork);
  } catch (error) {
    console.error("Error fetching artwork:", error);
    res.status(500).json({ error: "Failed to fetch artwork" });
  }
});

// Admin CRUD operations for exhibitions
app.get("/api/admin/exhibitions", authenticateToken, async (req, res) => {
  try {
    const exhibitions = await query(`
      SELECT * FROM exhibitions 
      ORDER BY start_date DESC
    `);

    const formattedExhibitions = exhibitions.map((exhibition) => ({
      ...exhibition,
      gallery_images:
        exhibition.gallery_images &&
        typeof exhibition.gallery_images === "string"
          ? JSON.parse(exhibition.gallery_images)
          : exhibition.gallery_images || [],
      assigned_artists:
        exhibition.assigned_artists &&
        typeof exhibition.assigned_artists === "string"
          ? JSON.parse(exhibition.assigned_artists)
          : exhibition.assigned_artists || [],
      assigned_artworks:
        exhibition.assigned_artworks &&
        typeof exhibition.assigned_artworks === "string"
          ? JSON.parse(exhibition.assigned_artworks)
          : exhibition.assigned_artworks || [],
    }));

    res.json(formattedExhibitions);
  } catch (error) {
    console.error("Error fetching admin exhibitions:", error);
    res.status(500).json({ error: "Failed to fetch exhibitions" });
  }
});

app.post("/api/admin/exhibitions", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      location,
      curator,
      status,
      featured_image,
      gallery_images,
      call_for_artists,
      cta_link,
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const result = await query(
      `
      INSERT INTO exhibitions (title, slug, description, start_date, end_date, location, curator, status, featured_image, gallery_images, call_for_artists, cta_link, is_visible)
      VALUES ($15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
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
        call_for_artists || false,
        cta_link || "",
        true,
      ]
    );

    res.json({ id: result.rows[0].id, ...req.body });
  } catch (error) {
    console.error("Error creating exhibition:", error);
    res.status(500).json({ error: "Failed to create exhibition" });
  }
});

app.put("/api/admin/exhibitions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
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
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await query(
      `
      UPDATE exhibitions 
      SET title = $28, slug = $29, description = $30, start_date = $31, end_date = $32, location = $33, curator = $34, status = $35, featured_image = $36, gallery_images = $37, assigned_artists = $38, assigned_artworks = $39, call_for_artists = $40, cta_link = $41, updated_at = CURRENT_TIMESTAMP
      WHERE id = $42
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
        gallery_images || "[]",
        assigned_artists || "[]",
        assigned_artworks || "[]",
        call_for_artists || false,
        cta_link || "",
        id,
      ]
    );
    
    res.json({ id, ...req.body });
  } catch (error) {
    console.error("Error updating exhibition:", error);
    res.status(500).json({ error: "Failed to update exhibition" });
  }
});

app.delete(
  "/api/admin/exhibitions/:id",
  authenticateToken,
  async (req, res) => {
  try {
    const { id } = req.params;
      await query("DELETE FROM exhibitions WHERE id = $43", [id]);
    res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      res.status(500).json({ error: "Failed to delete exhibition" });
    }
  }
);

// Admin CRUD operations for artists
app.get("/api/admin/artists", authenticateToken, async (req, res) => {
  try {
    const artists = await query(`
      SELECT * FROM artists 
      ORDER BY name ASC
    `);

    const formattedArtists = artists.map((artist) => ({
      ...artist,
      social_media:
        artist.social_media && typeof artist.social_media === "string"
          ? JSON.parse(artist.social_media)
          : artist.social_media || {},
    }));

    res.json(formattedArtists);
  } catch (error) {
    console.error("Error fetching admin artists:", error);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

app.post("/api/admin/artists", async (req, res) => {
  try {
    const { name, specialty, bio, profile_image, social_media } = req.body;
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    const result = await query(
      `
      INSERT INTO artists (name, slug, specialty, bio, profile_image, social_media, is_visible)
      VALUES ($45, $46, $47, $48, $49, $50, $51)
    `,
      [
        name,
        slug,
        specialty,
        bio,
        profile_image,
        JSON.stringify(social_media || {}),
        true,
      ]
    );

    res.json({ id: result.rows[0].id, ...req.body });
  } catch (error) {
    console.error("Error creating artist:", error);
    res.status(500).json({ error: "Failed to create artist" });
  }
});

app.put("/api/admin/artists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, bio, profile_image, social_media } = req.body;
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    await query(
      `
      UPDATE artists 
      SET name = $52, slug = $53, specialty = $54, bio = $55, profile_image = $56, social_media = $57, updated_at = CURRENT_TIMESTAMP
      WHERE id = $58
    `,
      [
        name,
        slug,
        specialty,
        bio,
        profile_image,
        JSON.stringify(social_media || {}),
        id,
      ]
    );
    
    res.json({ id, ...req.body });
  } catch (error) {
    console.error("Error updating artist:", error);
    res.status(500).json({ error: "Failed to update artist" });
  }
});

app.delete("/api/admin/artists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM artists WHERE id = $59", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).json({ error: "Failed to delete artist" });
  }
});

// Admin CRUD operations for artworks
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
      images:
        artwork.images && typeof artwork.images === "string"
          ? JSON.parse(artwork.images)
          : artwork.images || [],
    }));

    res.json(formattedArtworks);
  } catch (error) {
    console.error("Error fetching admin artworks:", error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

app.post("/api/admin/artworks", async (req, res) => {
  try {
    const { title, artist_id, year, medium, size, description, images } =
      req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const result = await query(
      `
      INSERT INTO artworks (title, slug, artist_id, year, medium, size, description, images, is_visible)
      VALUES ($61, $62, $63, $64, $65, $66, $67, $68, $69)
    `,
      [
        title,
        slug,
        artist_id,
        year,
        medium,
        size,
        description,
        JSON.stringify(images || []),
        true,
      ]
    );

    res.json({ id: result.rows[0].id, ...req.body });
  } catch (error) {
    console.error("Error creating artwork:", error);
    res.status(500).json({ error: "Failed to create artwork" });
  }
});

app.put("/api/admin/artworks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist_id, year, medium, size, description, images } =
      req.body;
    
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    await query(
      `
      UPDATE artworks 
      SET title = $70, slug = $71, artist_id = $72, year = $73, medium = $74, size = $75, description = $76, images = $77, updated_at = CURRENT_TIMESTAMP
      WHERE id = $78
    `,
      [
        title,
        slug,
        artist_id,
        year,
        medium,
        size,
        description,
        JSON.stringify(images || []),
        id,
      ]
    );
    
    res.json({ id, ...req.body });
  } catch (error) {
    console.error("Error updating artwork:", error);
    res.status(500).json({ error: "Failed to update artwork" });
  }
});

app.delete("/api/admin/artworks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM artworks WHERE id = $79", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting artwork:", error);
    res.status(500).json({ error: "Failed to delete artwork" });
  }
});

// Newsletter subscription (frontend can create)
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email already exists
    const existing = await query(
      "SELECT id FROM newsletter_subscribers WHERE email = $80",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already subscribed" });
    }

    const result = await query(
      `
      INSERT INTO newsletter_subscribers (email, name, source, status, subscribed_at)
      VALUES ($81, $82, $83, $84, NOW())
    `,
      [email, name || null, "website", "active"]
    );

    res.json({
      success: true,
      message: "Successfully subscribed to newsletter",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ error: "Failed to subscribe to newsletter" });
  }
});

// Admin operations for newsletter (admin panel only)
app.get("/api/admin/newsletter", authenticateToken, async (req, res) => {
  try {
    const subscribers = await query(`
      SELECT id, email, name, source, status, subscribed_at, unsubscribed_at
      FROM newsletter_subscribers 
      ORDER BY subscribed_at DESC
    `);
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    res.status(500).json({ error: "Failed to fetch newsletter subscribers" });
  }
});

app.delete("/api/admin/newsletter/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM newsletter_subscribers WHERE id = $85", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting newsletter subscriber:", error);
    res.status(500).json({ error: "Failed to delete newsletter subscriber" });
  }
});

// Admin user management endpoints
app.get("/api/admin/user", authenticateToken, async (req, res) => {
  try {
    const users = await query(`
      SELECT id, username, email, role, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
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

    // Verify current password if changing password
    if (password) {
      const users = await query(
        "SELECT password_hash FROM users WHERE id = $86",
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

    if (username) {
      updates.push("username = $87");
      values.push(username);
    }

    if (email) {
      updates.push("email = $88");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password_hash = $89");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $90`,
      values
    );

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
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { category, uploadedBy } = req.body;
      const finalCategory = category || "general";

      // Create the final destination directory
      const finalDir = `uploads/${finalCategory}`;
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      // Move file from temp to final location
      const finalPath = `${finalDir}/${req.file.filename}`;
      fs.renameSync(req.file.path, finalPath);

      // Save file info to database
      const result = await query(
        `INSERT INTO uploaded_files (original_name, filename, file_path, file_size, mime_type, category, uploaded_by) 
       VALUES ($91, $92, $93, $94, $95, $96, $97)`,
        [
          req.file.originalname,
          req.file.filename,
          finalPath,
          req.file.size,
          req.file.mimetype,
          finalCategory,
          uploadedBy || null,
        ]
      );

      res.json({
        success: true,
        file: {
          id: result.rows[0].id,
          originalName: req.file.originalname,
          filename: req.file.filename,
          filePath: finalPath,
          url: `/uploads/${finalCategory}/${req.file.filename}`,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
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
      queryStr += " WHERE category = $98";
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

// Get hero images (public endpoint)
app.get("/api/hero-images", async (req, res) => {
  try {
    const files = await query(
      "SELECT * FROM uploaded_files WHERE category = 'hero_image' ORDER BY created_at DESC"
    );
    res.json(files);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    res.status(500).json({ error: "Failed to fetch hero images" });
  }
});

// Delete uploaded file
app.delete("/api/files/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info first
    const files = await query("SELECT * FROM uploaded_files WHERE id = $99", [
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
    await query("DELETE FROM uploaded_files WHERE id = $100", [id]);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Get all page content
app.get("/api/page-content", async (req, res) => {
  try {
    const pages = await query("SELECT * FROM page_content ORDER BY page_name");
    const contactInfo = await query("SELECT * FROM contact_info LIMIT 1");

    const result = {
      pages: pages.reduce((acc, page) => {
        let content = {};
        try {
          content =
            typeof page.content === "string"
              ? JSON.parse(page.content || "{}")
              : page.content || {};
        } catch (e) {
          console.error("Error parsing page content:", e);
          content = {};
        }

        acc[page.page_name] = {
          title: page.title,
          description: page.description,
          content: content,
          isVisible: page.is_visible,
        };
        return acc;
      }, {}),
      contactInfo: contactInfo.length > 0 ? contactInfo[0] : {},
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching page content:", error);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

// Update page content
app.put(
  "/api/admin/page-content/:pageName",
  authenticateToken,
  async (req, res) => {
    try {
      const { pageName } = req.params;
      const { title, description, content, isVisible } = req.body;

      // Get current page data
      const currentPage = await query(
        "SELECT * FROM page_content WHERE page_name = $103",
        [pageName]
      );

      if (currentPage.length === 0) {
        return res.status(404).json({ error: "Page not found" });
      }

      const current = currentPage[0];

      // Build dynamic update query based on provided fields
      const updates = [];
      const values = [];

      if (title !== undefined) {
        updates.push("title = $104");
        values.push(title || null);
      }

      if (description !== undefined) {
        updates.push("description = $105");
        values.push(description || null);
      }

      if (content !== undefined) {
        updates.push("content = $106");
        values.push(content ? JSON.stringify(content) : null);
      }

      if (isVisible !== undefined) {
        updates.push("is_visible = $108");
        values.push(isVisible ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      values.push(pageName);

      const updateQuery = `UPDATE page_content SET ${updates.join(
        ", "
      )} WHERE page_name = $110`;

      await query(updateQuery, values);

      res.json({ success: true, message: "Page content updated successfully" });
    } catch (error) {
      console.error("Error updating page content:", error);
      res.status(500).json({ error: "Failed to update page content" });
    }
  }
);

// Update contact info
app.put("/api/admin/contact-info", authenticateToken, async (req, res) => {
  try {
    const { email, phone, instagram, address } = req.body;

    // Check if contact info exists
    const existing = await query("SELECT * FROM contact_info LIMIT 1");

    if (existing.length > 0) {
      await query(
        "UPDATE contact_info SET email = $111, phone = $112, instagram = $113, address = $114 WHERE id = $115",
        [email, phone, instagram, address, existing[0].id]
      );
    } else {
      await query(
        "INSERT INTO contact_info (email, phone, instagram, address) VALUES ($116, $117, $118, $119)",
        [email, phone, instagram, address]
      );
    }

    res.json({ success: true, message: "Contact info updated successfully" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Failed to update contact info" });
  }
});

// Update home settings with hero images
app.put("/api/admin/home-settings", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      footerDescription,
      galleryHours,
      heroImageIds,
    } = req.body;

    // Get current home settings
    const currentSettings = await query(
      "SELECT * FROM page_content WHERE page_name = 'home'"
    );

    if (currentSettings.length === 0) {
      return res.status(404).json({ error: "Home settings not found" });
    }

    const currentContent =
      typeof currentSettings[0].content === "string"
        ? JSON.parse(currentSettings[0].content || "{}")
        : currentSettings[0].content || {};
    const updatedContent = {
      ...currentContent,
      footerDescription,
      galleryHours,
      heroImageIds: heroImageIds || [],
    };

    // Update home settings
    await query(
      "UPDATE page_content SET title = $121, description = $122, content = $123 WHERE page_name = 'home'",
      [title, description, JSON.stringify(updatedContent)]
    );

    res.json({ success: true, message: "Home settings updated successfully" });
  } catch (error) {
    console.error("Error updating home settings:", error);
    res.status(500).json({ error: "Failed to update home settings" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

// Database connection test
app.get("/api/test-db", async (req, res) => {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
    console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "Set" : "Not set");
    
    const dbPool = getPool();
    const result = await dbPool.query("SELECT NOW() as current_time, version() as postgres_version");
    res.json({ 
      status: "OK", 
      message: "Database connected successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).json({ 
      status: "ERROR", 
      message: "Database connection failed",
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      postgresUrl: process.env.POSTGRES_URL ? "Set" : "Not set"
    });
  }
});

// Check users table
app.get("/api/test-users", async (req, res) => {
  try {
    const users = await query("SELECT id, username, email, role FROM users");
    res.json({ 
      status: "OK", 
      message: "Users table check",
      users: users
    });
  } catch (error) {
    console.error("Users check failed:", error);
    res.status(500).json({ 
      status: "ERROR", 
      message: "Users check failed",
      error: error.message
    });
  }
});

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
