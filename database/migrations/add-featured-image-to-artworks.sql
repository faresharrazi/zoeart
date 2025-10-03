-- Add featured_image field to artworks table
-- This script adds a featured_image field to store the featured image URL for artworks

-- For PostgreSQL
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500);

-- For MySQL (if needed)
-- ALTER TABLE artworks ADD COLUMN featured_image VARCHAR(500);

-- Update existing artworks to use the first image as featured image if no featured image is set
UPDATE artworks 
SET featured_image = (
  CASE 
    WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
    THEN images->0 
    ELSE NULL 
  END
)
WHERE featured_image IS NULL;

-- For MySQL equivalent:
-- UPDATE artworks 
-- SET featured_image = (
--   CASE 
--     WHEN images IS NOT NULL AND JSON_LENGTH(images) > 0 
--     THEN JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]'))
--     ELSE NULL 
--   END
-- )
-- WHERE featured_image IS NULL;
