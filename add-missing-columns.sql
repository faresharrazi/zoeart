-- Add missing columns to hero_images table
-- This will add the columns that should have been created by the original script

-- Add missing columns
ALTER TABLE hero_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE hero_images ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE hero_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE hero_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records
UPDATE hero_images 
SET 
    display_order = id - 1, -- Use id as display order (0, 1, 2, etc.)
    is_active = true,
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE display_order IS NULL OR is_active IS NULL;

-- Verify the fix
SELECT 
    id,
    cloudinary_url,
    original_name,
    display_order,
    is_active,
    created_at
FROM hero_images 
ORDER BY display_order;
