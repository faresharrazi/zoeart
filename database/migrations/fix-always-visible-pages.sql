-- Fix Contact and Exhibition pages to always be visible
-- These pages should never be hidden as they are core navigation pages

UPDATE page_content 
SET is_visible = TRUE 
WHERE page_name IN ('contact', 'exhibitions');

-- Verify the changes
SELECT page_name, title, is_visible 
FROM page_content 
WHERE page_name IN ('contact', 'exhibitions', 'home')
ORDER BY page_name;
