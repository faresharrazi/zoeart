const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
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
  res.json({ status: "OK", message: "API is running" });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await query("SELECT NOW() as current_time, version() as postgres_version");
    res.json({
      status: "OK",
      message: "Database connected successfully",
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
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

// Get page content
app.get("/api/page-content", async (req, res) => {
  try {
    const pages = await query("SELECT * FROM page_content");
    const contactInfo = await query("SELECT * FROM contact_info");

    const pageData = pages.reduce((acc, page) => {
      try {
        acc[page.page_name] = {
          ...page,
          content: typeof page.content === "string"
            ? JSON.parse(page.content || "{}")
            : page.content || {}
        };
      } catch (e) {
        acc[page.page_name] = { ...page, content: {} };
      }
      return acc;
    }, {});

    res.json({
      ...pageData,
      contactInfo: contactInfo.length > 0 ? contactInfo[0] : {},
    });
  } catch (error) {
    console.error("Error fetching page content:", error);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

// Get hero images
app.get("/api/hero-images", async (req, res) => {
  try {
    // For now, return empty array - this can be expanded later
    res.json([]);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    res.status(500).json({ error: "Failed to fetch hero images" });
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

    if (title !== undefined) {
      updates.push("title = $1");
      values.push(title || null);
    }

    if (description !== undefined) {
      updates.push("description = $2");
      values.push(description || null);
    }

    if (content !== undefined) {
      updates.push("content = $3");
      values.push(content ? JSON.stringify(content) : null);
    }

    if (isVisible !== undefined) {
      updates.push("is_visible = $4");
      values.push(isVisible ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: "No changes to update" });
    }

    values.push(pageName);

    const updateQuery = `UPDATE page_content SET ${updates.join(
      ", "
    )} WHERE page_name = $5`;

    await query(updateQuery, values);

    res.json({ success: true, message: "Page content updated successfully" });
  } catch (error) {
    console.error("Error updating page content:", error);
    res.status(500).json({ error: "Failed to update page content" });
  }
});

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
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $4`,
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

// Get all artists (admin)
app.get("/api/admin/artists", authenticateToken, async (req, res) => {
  try {
    const artists = await query(`
      SELECT * FROM artists 
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

app.listen(PORT, () => {
  console.log(`🚀 Minimal API Server running on port ${PORT}`);
});

module.exports = app;
