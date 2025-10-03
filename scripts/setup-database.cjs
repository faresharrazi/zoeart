const { Pool } = require("pg");

// Database setup script for Neon PostgreSQL
async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log("🔗 Connecting to database...");

    // Read the schema file
    const fs = require("fs");
    const schema = fs.readFileSync("./database-schema-postgres.sql", "utf8");

    console.log("📋 Executing database schema...");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log("✅ Executed:", statement.substring(0, 50) + "...");
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (
            !error.message.includes("already exists") &&
            !error.message.includes("duplicate key")
          ) {
            console.log("⚠️  Warning:", error.message);
          }
        }
      }
    }

    console.log("🎉 Database setup completed successfully!");

    // Test the connection
    const result = await pool.query("SELECT COUNT(*) FROM users");
    console.log("👤 Users table has", result.rows[0].count, "records");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("✅ Setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
