-- Clear old hero images from page_content table
-- This will remove legacy database URLs and allow fresh Cloudinary uploads

UPDATE page_content 
SET content = jsonb_set(
  content, 
  '{heroImages}', 
  '[]'::jsonb
)
WHERE page_name = 'home';

UPDATE page_content 
SET content = jsonb_set(
  content, 
  '{heroImageIds}', 
  '[]'::jsonb
)
WHERE page_name = 'home';

-- Verify the update
SELECT page_name, content->'heroImages' as hero_images, content->'heroImageIds' as hero_image_ids
FROM page_content 
WHERE page_name = 'home';
