-- Aether Art Space Database Schema (PostgreSQL)
-- This file contains all the necessary tables for the art gallery website

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists table
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

-- Artworks table
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
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(200),
    curator VARCHAR(100),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
    featured_image VARCHAR(255),
    gallery_images JSONB,
    assigned_artists JSONB,
    assigned_artworks JSONB,
    call_for_artists BOOLEAN DEFAULT FALSE,
    cta_link VARCHAR(255),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Page content table
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

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source VARCHAR(50) DEFAULT 'website',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

-- Uploaded files table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('hero_image', 'artwork', 'artist_profile', 'exhibition', 'gallery')),
    file_data BYTEA, -- Store binary file data directly in database
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact information table
CREATE TABLE IF NOT EXISTS contact_info (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    phone VARCHAR(20),
    instagram VARCHAR(100),
    address TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@aetherartspace.com', '$2b$10$cRiBpAKdF3FFdYgW8gwGteiELv91PVX3TKIIh2NnDkYNDGv.s/WBy', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default contact information
INSERT INTO contact_info (email, phone, instagram, address) VALUES 
('info@aetherartspace.com', '+1 (555) 123-4567', '@aetherartspace', '123 Art Street, Creative District, NY 10001')
ON CONFLICT (id) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, content, is_visible) VALUES 
('home', 'Aether Art Space', 'Explore the Art of Tomorrow', '{"footerDescription": "A contemporary art space dedicated to showcasing extraordinary works from emerging and established artists. Visit us to experience art that challenges, inspires, and transforms.", "galleryHours": "Tuesday - Sunday: 10:00 AM - 6:00 PM"}', TRUE),
('exhibitions', 'Gallery Exhibitions', 'Discover our curated exhibitions that showcase the finest in contemporary art. From solo presentations to thematic group shows, each exhibition offers a unique journey through artistic vision.', '{}', TRUE),
('artists', 'Featured Artists', 'Meet the visionary artists whose works define our contemporary collection. Each brings a unique perspective and mastery of their craft to create pieces that inspire and provoke.', '{}', TRUE),
('gallery', 'Complete Collection', 'Explore our entire collection of contemporary artworks. Use the search and filter tools to discover pieces that speak to you.', '{}', TRUE),
('about', 'About Aether Art Space', 'A contemporary art gallery dedicated to showcasing extraordinary works from emerging and established artists around the world.', '{"blocks": [{"id": "block1", "title": "Our Mission", "content": "To showcase extraordinary works from emerging and established artists, creating a space where art challenges, inspires, and transforms.", "isVisible": true}, {"id": "block2", "title": "Our History", "content": "Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.", "isVisible": true}, {"id": "block3", "title": "Our Vision", "content": "To be the premier destination for contemporary art, fostering creativity and cultural exchange while supporting artists in their journey.", "isVisible": true}]}', TRUE),
('contact', 'Stay Connected', 'Subscribe to our newsletter for the latest exhibitions, artist features, and exclusive gallery events. Be the first to know about new collections and special openings.', '{}', TRUE)
ON CONFLICT (page_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_slug ON exhibitions(slug);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
