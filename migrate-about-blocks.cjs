const { Pool } = require("pg");

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrateAboutBlocks() {
  const client = await pool.connect();

  try {
    console.log("🔄 Starting About blocks migration...");

    // Create the about_blocks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS about_blocks (
        id SERIAL PRIMARY KEY,
        block_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        is_visible BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table created successfully");

    // Check if data already exists
    const existingData = await client.query(
      "SELECT COUNT(*) FROM about_blocks"
    );
    const count = parseInt(existingData.rows[0].count);

    if (count === 0) {
      // Insert the existing blocks
      await client.query(`
        INSERT INTO about_blocks (block_id, title, description, content, is_visible, sort_order) VALUES
        ('block1', 'Our Mission', 'Creating a living bridge between cultures, ideas, and artistic practices through exhibitions, residencies, and collaborative projects.', 'At Aether Art Space, our mission is to create a living bridge between cultures, ideas, and artistic practices. We champion painters and contemporary creators who explore form, materiality, and dialogue. Through exhibitions, residencies, and collaborative projects, we nurture meaningful encounters that challenge perception and invite new ways of seeing.', true, 1),
        ('block2', 'History', 'Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.', 'Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.

Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.

Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.

Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.', false, 2),
        ('block3', 'Our Vision', 'We envision art as a shared language that transcends borders, fostering exchange between Greece and East Asia and beyond.', 'We envision art as a shared language that transcends borders. Guided by the ancient concept of aether—the subtle element beyond air—we aim to cultivate a space where the rarefied and the real coexist. By fostering exchange between Greece and East Asia and beyond, we aspire to be a global platform where art reveals deeper connections between people, places, and cultures.', true, 3)
      `);

      console.log("✅ Sample data inserted successfully");
    } else {
      console.log("ℹ️  Data already exists, skipping insertion");
    }

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_about_blocks_visible ON about_blocks(is_visible);
      CREATE INDEX IF NOT EXISTS idx_about_blocks_sort_order ON about_blocks(sort_order);
      CREATE INDEX IF NOT EXISTS idx_about_blocks_block_id ON about_blocks(block_id);
    `);

    console.log("✅ Indexes created successfully");

    // Verify the data
    const result = await client.query(
      "SELECT * FROM about_blocks ORDER BY sort_order ASC"
    );
    console.log(`✅ Migration completed! Found ${result.rows.length} blocks:`);
    result.rows.forEach((block) => {
      console.log(
        `  - ${block.title} (${block.block_id}) - ${
          block.is_visible ? "Visible" : "Hidden"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateAboutBlocks()
  .then(() => {
    console.log("🎉 About blocks migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
