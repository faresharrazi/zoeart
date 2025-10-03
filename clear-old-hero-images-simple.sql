-- Simple script to clear old hero images from page_content table
-- This will remove the old heroImages and heroImageIds from the home page content

UPDATE page_content 
SET content = content - 'heroImages' - 'heroImageIds'
WHERE page_name = 'home';

-- Verify the update
SELECT 
    page_name,
    content->'heroImages' as hero_images,
    content->'heroImageIds' as hero_image_ids
FROM page_content 
WHERE page_name = 'home';

-- Show current hero_images table status
SELECT 
    COUNT(*) as total_hero_images,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_hero_images
FROM hero_images;
