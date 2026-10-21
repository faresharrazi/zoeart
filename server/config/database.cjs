const { Pool } = require("pg");

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

// Query helper function
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Close all connections
const closeConnections = async () => {
  try {
    await pool.end();
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  closeConnections,
};
