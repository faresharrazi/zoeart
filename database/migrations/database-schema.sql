-- Aether Art Space Database Schema
-- This file contains all the necessary tables for the art gallery website

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS aether_art_space;
-- USE aether_art_space;

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    specialty VARCHAR(100),
    profile_image VARCHAR(255),
    social_media JSON,
    assigned_artworks JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    artist_id INT,
    year INT,
    medium VARCHAR(100),
    size VARCHAR(100),
    description TEXT,
    images JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

-- Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(200),
    curator VARCHAR(100),
    status ENUM('upcoming', 'past') DEFAULT 'upcoming',
    featured_image VARCHAR(255),
    gallery_images JSON,
    assigned_artists JSON,
    assigned_artworks JSON,
    call_for_artists BOOLEAN DEFAULT FALSE,
    cta_link VARCHAR(255),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Page content table
CREATE TABLE IF NOT EXISTS page_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    page_name VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200),
    description TEXT,
    content JSON,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NULL,
    status ENUM('active', 'unsubscribed') DEFAULT 'active',
    source VARCHAR(50) DEFAULT 'website',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL
);

-- Uploaded files table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category ENUM('hero_image', 'artwork', 'artist_profile', 'exhibition', 'gallery') NOT NULL,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Contact information table
CREATE TABLE IF NOT EXISTS contact_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100),
    phone VARCHAR(20),
    instagram VARCHAR(100),
    address TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@aetherartspace.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Insert default contact information
INSERT INTO contact_info (email, phone, instagram, address) VALUES 
('info@aetherartspace.com', '+1 (555) 123-4567', '@aetherartspace', '123 Art Street, Creative District, NY 10001')
ON DUPLICATE KEY UPDATE email = email;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, content, is_visible) VALUES 
('home', 'Aether Art Space', 'Explore the Art of Tomorrow', '{"footerDescription": "A contemporary art space dedicated to showcasing extraordinary works from emerging and established artists. Visit us to experience art that challenges, inspires, and transforms.", "galleryHours": "Tuesday - Sunday: 10:00 AM - 6:00 PM"}', TRUE),
('exhibitions', 'Gallery Exhibitions', 'Discover our curated exhibitions that showcase the finest in contemporary art. From solo presentations to thematic group shows, each exhibition offers a unique journey through artistic vision.', '{}', TRUE),
('artists', 'Featured Artists', 'Meet the visionary artists whose works define our contemporary collection. Each brings a unique perspective and mastery of their craft to create pieces that inspire and provoke.', '{}', TRUE),
('gallery', 'Complete Collection', 'Explore our entire collection of contemporary artworks. Use the search and filter tools to discover pieces that speak to you.', '{}', TRUE),
('about', 'About Aether Art Space', 'A contemporary art gallery dedicated to showcasing extraordinary works from emerging and established artists around the world.', '{"blocks": [{"id": "block1", "title": "Our Mission", "content": "To showcase extraordinary works from emerging and established artists, creating a space where art challenges, inspires, and transforms.", "isVisible": true}, {"id": "block2", "title": "Our History", "content": "Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.", "isVisible": true}, {"id": "block3", "title": "Our Vision", "content": "To be the premier destination for contemporary art, fostering creativity and cultural exchange while supporting artists in their journey.", "isVisible": true}]}', TRUE),
('contact', 'Stay Connected', 'Subscribe to our newsletter for the latest exhibitions, artist features, and exclusive gallery events. Be the first to know about new collections and special openings.', '{}', TRUE)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Create indexes for better performance
CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX idx_exhibitions_slug ON exhibitions(slug);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
