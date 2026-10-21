require("dotenv").config({ path: [".env.local", ".env"], quiet: true });

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

// Applies database/schema.sql, optionally loads the dev seed, and creates the
// first admin user from ADMIN_USERNAME / ADMIN_PASSWORD when no user exists.
//
//   node scripts/setup-database.cjs          # schema + first admin
//   node scripts/setup-database.cjs --seed   # also load sample content (dev only)
async function setupDatabase({ seed = false } = {}) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  const readSql = (file) =>
    fs.readFileSync(path.join(__dirname, "../database", file), "utf8");

  try {
    console.log("Applying schema...");
    await pool.query(readSql("schema.sql"));

    if (seed) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Refusing to load sample content in production");
      }
      console.log("Loading sample content...");
      await pool.query(readSql("seed-dev.sql"));
    }

    const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM users");
    if (rows[0].count === 0) {
      const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;
      if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.log(
          "No users yet. Set ADMIN_USERNAME and ADMIN_PASSWORD and run again to create the first admin."
        );
      } else if (ADMIN_PASSWORD.length < 12) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters");
      } else {
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await pool.query(
          "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'admin')",
          [ADMIN_USERNAME, ADMIN_EMAIL || `${ADMIN_USERNAME}@localhost`, passwordHash]
        );
        console.log(`Created admin user "${ADMIN_USERNAME}"`);
      }
    }

    console.log("Database ready");
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase({ seed: process.argv.includes("--seed") }).catch((error) => {
    console.error("Setup failed:", error.message);
    process.exit(1);
  });
}

module.exports = setupDatabase;
