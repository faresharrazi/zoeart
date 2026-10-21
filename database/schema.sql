-- Aether Art Space database schema (PostgreSQL)
--
-- Current, consolidated schema. It is idempotent: safe to run on an empty
-- database or on one that already has these tables. The files in
-- migrations/ are the historical steps that led here; use them only to
-- bring an older database up to date.
--
-- No user accounts are created here. Run `npm run db:setup` with
-- ADMIN_USERNAME / ADMIN_PASSWORD set to create the first admin.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    specialty VARCHAR(100),
    profile_image VARCHAR(255),
    social_media JSONB,
    assigned_artworks JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
    year INTEGER,
    medium VARCHAR(100),
    size VARCHAR(100),
    description TEXT,
    images JSONB,
    featured_image VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exhibitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(200),
    curator VARCHAR(100),
    status VARCHAR(20) DEFAULT 'upcoming',
    featured_image VARCHAR(255),
    gallery_images JSONB,
    assigned_artists JSONB,
    assigned_artworks JSONB,
    call_for_artists BOOLEAN DEFAULT FALSE,
    cta_link VARCHAR(255),
    press_media_name VARCHAR(255),
    press_media_link VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE exhibitions DROP CONSTRAINT IF EXISTS exhibitions_status_check;
ALTER TABLE exhibitions ADD CONSTRAINT exhibitions_status_check
    CHECK (status IN ('upcoming', 'current', 'past'));

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER UNIQUE REFERENCES exhibitions(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    featured_image VARCHAR(255),
    media_files JSONB,
    author VARCHAR(100),
    published_at TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_content (
    id SERIAL PRIMARY KEY,
    page_name VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200),
    description TEXT,
    content JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS about_blocks (
    id SERIAL PRIMARY KEY,
    block_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_info (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    phone VARCHAR(20),
    instagram VARCHAR(100),
    address TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS working_hours (
    id SERIAL PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    time_frame VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero_images (
    id SERIAL PRIMARY KEY,
    cloudinary_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(200) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    format VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source VARCHAR(50) DEFAULT 'website',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

-- Files uploaded before Cloudinary, and the fallback when Cloudinary is not
-- configured. The binary is stored in file_data.
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('hero_image', 'artwork', 'artist_profile', 'exhibition', 'gallery')),
    file_data BYTEA,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_about_blocks_sort_order ON about_blocks(sort_order);
CREATE INDEX IF NOT EXISTS idx_hero_images_order ON hero_images(display_order);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

CREATE OR REPLACE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_about_blocks_updated_at BEFORE UPDATE ON about_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON working_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON hero_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rows the site expects to exist. Existing rows are left untouched.
INSERT INTO page_content (page_name, title, description, content, is_visible) VALUES
('home', 'Aether Art Space', 'Explore the Art of Tomorrow', '{}', TRUE),
('exhibitions', 'Exhibitions', 'Discover our curated exhibitions.', '{}', TRUE),
('artists', 'Artists', 'Meet the artists we work with.', '{}', TRUE),
('gallery', 'Collection', 'Explore our collection of contemporary artworks.', '{}', TRUE),
('about', 'About', 'A contemporary art space.', '{}', TRUE),
('contact', 'Stay Connected', 'Subscribe to our newsletter for the latest exhibitions and events.', '{}', TRUE)
ON CONFLICT (page_name) DO NOTHING;

INSERT INTO contact_info (email, phone, instagram, address)
SELECT '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM contact_info);

INSERT INTO working_hours (day, time_frame, is_active)
SELECT d.day, d.time_frame, TRUE
FROM (VALUES
    (1, 'Monday', 'Closed'),
    (2, 'Tuesday', '10:00 AM - 6:00 PM'),
    (3, 'Wednesday', '10:00 AM - 6:00 PM'),
    (4, 'Thursday', '10:00 AM - 6:00 PM'),
    (5, 'Friday', '10:00 AM - 6:00 PM'),
    (6, 'Saturday', '10:00 AM - 6:00 PM'),
    (7, 'Sunday', 'Closed')
) AS d(n, day, time_frame)
WHERE NOT EXISTS (SELECT 1 FROM working_hours)
ORDER BY d.n;
