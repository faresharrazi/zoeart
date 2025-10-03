-- Create separate hero_images table for Cloudinary URLs
-- This will replace the old logic that mixed database files with Cloudinary URLs

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

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_images_order ON hero_images(display_order);

-- Add comment to explain the table
COMMENT ON TABLE hero_images IS 'Stores hero images with Cloudinary URLs for home page slider';
COMMENT ON COLUMN hero_images.cloudinary_url IS 'Full Cloudinary URL for the image';
COMMENT ON COLUMN hero_images.cloudinary_public_id IS 'Cloudinary public ID for management';
COMMENT ON COLUMN hero_images.display_order IS 'Order of images in the slider (0 = first)';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'hero_images'
ORDER BY ordinal_position;
