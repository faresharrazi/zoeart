const jwt = require("jsonwebtoken");
const { query } = require("../config/database.cjs");

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}

const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret";
const JWT_OPTIONS = { algorithms: ["HS256"] };

// Authentication middleware. Verifies the token, then loads the user so that
// deleted accounts and role changes take effect immediately.
const authenticateToken = async (req, res, next) => {
  if (req.user) return next(); // already verified earlier in this request

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET, JWT_OPTIONS);
  } catch (err) {
    return res.status(401).json({
      error: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      message: "Please login again",
    });
  }

  try {
    const result = await query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [payload.id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Account no longer exists",
        code: "INVALID_TOKEN",
        message: "Please login again",
      });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // Extended to 7 days
};

// Verify JWT token (for manual verification)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, JWT_OPTIONS);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken,
  requireAdmin,
};
