-- Aether Art Space - Database Setup Script
-- Run this in phpMyAdmin or MySQL command line

-- Create database (uncomment if needed)
-- CREATE DATABASE aether_art_space;
-- USE aether_art_space;

-- Create tables
CREATE TABLE IF NOT EXISTS exhibitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    curator VARCHAR(255),
    status ENUM('upcoming', 'past') DEFAULT 'upcoming',
    featured_image VARCHAR(500),
    gallery_images JSON,
    assigned_artists JSON,
    assigned_artworks JSON,
    call_for_artists BOOLEAN DEFAULT FALSE,
    cta_link VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    profile_image VARCHAR(500),
    social_media JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    artist_id INT,
    year INT,
    medium VARCHAR(255),
    size VARCHAR(255),
    description TEXT,
    images JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS page_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    content JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(50),
    instagram VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    gallery_hours TEXT,
    footer_description TEXT,
    hero_image_ids JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE username = username;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, content, is_visible) VALUES
('home', 'Aether Art Space', 'Explore the Art of Tomorrow', '{"galleryHours": "Everyday", "footerDescription": "This is a simple description"}', TRUE),
('exhibitions', 'Gallery Exhibitions', 'Discover our curated exhibitions that showcase the best in contemporary art.', '{}', TRUE),
('artists', 'Featured Artists', 'Meet the visionary artists whose works define our gallery.', '{}', TRUE),
('gallery', 'Complete Collection', 'Explore our entire collection of contemporary artworks.', '{}', TRUE),
('about', 'About Aether Art Space', 'A contemporary art gallery dedicated to showcasing emerging and established artists.', '{"content": {"blocks": [{"title": "Our Mission", "content": "To promote contemporary art and support emerging artists.", "visible": true}, {"title": "Our History", "content": "Founded in 2024, we have been showcasing exceptional contemporary art.", "visible": true}, {"title": "Our Vision", "content": "To be a leading platform for contemporary art discovery.", "visible": true}]}}', TRUE),
('contact', 'Contact us', 'We will not answer anyway', '{}', TRUE)
ON DUPLICATE KEY UPDATE page_name = page_name;

-- Insert default contact info
INSERT INTO contact_info (email, phone, instagram, address) VALUES
('fares@fares.fares', '', '', '')
ON DUPLICATE KEY UPDATE email = email;

-- Insert default home settings
INSERT INTO home_settings (title, description, gallery_hours, footer_description, hero_image_ids) VALUES
('Aether Art Space', 'Explore the Art of Tomorrow', 'Everyday', 'This is a simple description', '[]')
ON DUPLICATE KEY UPDATE title = title;

-- Create indexes for better performance
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_exhibitions_visible ON exhibitions(is_visible);
CREATE INDEX idx_artists_visible ON artists(is_visible);
CREATE INDEX idx_artworks_visible ON artworks(is_visible);
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_page_content_name ON page_content(page_name);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Success message
SELECT 'Database setup completed successfully!' as message;
