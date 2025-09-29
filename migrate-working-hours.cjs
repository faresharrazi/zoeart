const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrateWorkingHours() {
  const client = await pool.connect();
  
  try {
    console.log('Starting working hours migration...');
    
    // Create working_hours table
    await client.query(`
      CREATE TABLE IF NOT EXISTS working_hours (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        time_frame VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insert default working hours (Monday to Sunday)
    await client.query(`
      INSERT INTO working_hours (day, time_frame, is_active) VALUES 
      ('Monday', 'Closed', true),
      ('Tuesday', '10:00 AM - 6:00 PM', true),
      ('Wednesday', '10:00 AM - 6:00 PM', true),
      ('Thursday', '10:00 AM - 6:00 PM', true),
      ('Friday', '10:00 AM - 6:00 PM', true),
      ('Saturday', '10:00 AM - 6:00 PM', true),
      ('Sunday', '12:00 PM - 5:00 PM', true)
      ON CONFLICT DO NOTHING;
    `);
    
    // Remove footerDescription and galleryHours from home page content
    await client.query(`
      UPDATE page_content 
      SET content = content - 'footerDescription' - 'galleryHours'
      WHERE page_name = 'home';
    `);
    
    // Create trigger for working_hours updated_at
    await client.query(`
      CREATE TRIGGER update_working_hours_updated_at 
      BEFORE UPDATE ON working_hours 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('Working hours migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateWorkingHours()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateWorkingHours };
