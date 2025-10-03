-- Fix hero_images table to add missing columns
-- This will add the missing columns that the API expects

-- Add missing columns
ALTER TABLE hero_images 
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS format VARCHAR(20),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have proper values
UPDATE hero_images 
SET 
    display_order = id - 1, -- Use id as display order (0, 1, 2, etc.)
    is_active = true,
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE display_order IS NULL OR is_active IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'hero_images'
ORDER BY ordinal_position;

-- Verify the data
SELECT 
    id,
    cloudinary_url,
    cloudinary_public_id,
    original_name,
    display_order,
    is_active,
    created_at
FROM hero_images 
ORDER BY display_order;
