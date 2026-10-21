require("dotenv").config({ path: [".env.local", ".env"], quiet: true });

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Applies the dated migrations in database/migrations (YYYY-MM-DD-name.sql)
// that this database hasn't run yet, each in its own transaction, and
// records them in schema_migrations. Older, undated files there are history
// that is already part of database/schema.sql.
//
//   npm run db:migrate

const MIGRATIONS_DIR = path.join(__dirname, "../database/migrations");
const DATED = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.sql$/;

async function migrate(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

  const { rows } = await pool.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));
  const pending = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => DATED.test(name) && !applied.has(name))
    .sort();

  for (const name of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        name,
      ]);
      await client.query("COMMIT");
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`${name}: ${error.message}`);
    } finally {
      client.release();
    }
  }

  if (pending.length === 0) console.log("Database is up to date");
}

if (require.main === module) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
  migrate(pool)
    .catch((error) => {
      console.error("Migration failed:", error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = migrate;
