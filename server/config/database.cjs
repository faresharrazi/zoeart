const { Pool, types } = require("pg");

// Return DATE columns as "YYYY-MM-DD" strings instead of JS Dates at
// midnight server time, which shift by a day in other time zones.
types.setTypeParser(1082, (value) => value);

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

// Run fn(client) inside a transaction; rolls back if it throws.
const transaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
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
  transaction,
  testConnection,
  closeConnections,
};
