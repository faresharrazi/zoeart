-- Exhibition Articles Migration
-- This migration adds support for rich content articles attached to exhibitions

-- Articles table for exhibition content
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    exhibition_id INTEGER UNIQUE REFERENCES exhibitions(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL, -- Rich text content (HTML/Markdown)
    featured_image VARCHAR(255), -- Main article image
    media_files JSONB, -- Array of media file paths (images, videos)
    author VARCHAR(100),
    published_at TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at column
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_exhibition_id ON articles(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);

-- Add article_id column to exhibitions table for easier querying (optional)
-- ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL;
