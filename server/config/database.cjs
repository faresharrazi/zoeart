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
    console.log("✅ Database connected successfully");
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

// Get database statistics
const getDbStats = async () => {
  try {
    const stats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables 
      ORDER BY schemaname, tablename
    `);
    return stats.rows;
  } catch (error) {
    console.error("Error getting database stats:", error);
    return [];
  }
};

// Close all connections
const closeConnections = async () => {
  try {
    await pool.end();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  getDbStats,
  closeConnections,
};
