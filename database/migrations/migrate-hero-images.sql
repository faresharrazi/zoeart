-- Migrate hero images from page_content table to hero_images table
-- This script will extract the existing hero images and create records in the new table

DO $$
DECLARE
    home_content JSONB;
    hero_images_array JSONB;
    hero_image_ids_array JSONB;
    image_url TEXT;
    image_id INTEGER;
    i INTEGER;
    new_display_order INTEGER := 0;
BEGIN
    -- Get the home page content
    SELECT content INTO home_content 
    FROM page_content 
    WHERE page_name = 'home';
    
    -- Check if hero images exist
    IF home_content IS NOT NULL AND home_content ? 'heroImages' THEN
        hero_images_array := home_content->'heroImages';
        hero_image_ids_array := home_content->'heroImageIds';
        
        RAISE NOTICE 'Found hero images in page_content: %', jsonb_array_length(hero_images_array);
        
        -- Loop through each hero image
        FOR i IN 0..jsonb_array_length(hero_images_array) - 1 LOOP
            image_url := hero_images_array->i;
            image_id := (hero_image_ids_array->i)::INTEGER;
            
            RAISE NOTICE 'Processing image %: URL=%, ID=%', i, image_url, image_id;
            
            -- Check if this is a Cloudinary URL (new system) or database URL (old system)
            IF image_url LIKE 'https://res.cloudinary.com/%' THEN
                -- This is already a Cloudinary URL, extract the public_id
                DECLARE
                    public_id TEXT;
                    url_parts TEXT[];
                BEGIN
                    -- Extract public_id from Cloudinary URL
                    -- Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
                    url_parts := string_to_array(image_url, '/');
                    public_id := url_parts[array_length(url_parts, 1) - 1] || '/' || 
                                split_part(url_parts[array_length(url_parts, 1)], '.', 1);
                    
                    -- Insert into hero_images table
                    INSERT INTO hero_images (
                        cloudinary_url,
                        cloudinary_public_id,
                        original_name,
                        display_order,
                        is_active,
                        created_at,
                        updated_at
                    ) VALUES (
                        image_url,
                        public_id,
                        'migrated_' || image_id || '.jpg',
                        new_display_order,
                        true,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    );
                    
                    RAISE NOTICE 'Inserted Cloudinary image: %', public_id;
                END;
            ELSE
                -- This is a database URL (/api/files/ID), we need to get the file data
                DECLARE
                    file_record RECORD;
                BEGIN
                    -- Get the file data from uploaded_files table
                    SELECT * INTO file_record 
                    FROM uploaded_files 
                    WHERE id = image_id AND category IN ('hero_image', 'hero');
                    
                    IF FOUND THEN
                        -- Insert into hero_images table with database file info
                        INSERT INTO hero_images (
                            cloudinary_url,
                            cloudinary_public_id,
                            original_name,
                            file_size,
                            mime_type,
                            display_order,
                            is_active,
                            created_at,
                            updated_at
                        ) VALUES (
                            image_url, -- Keep the original URL for now
                            'legacy_' || image_id,
                            file_record.original_name,
                            file_record.file_size,
                            file_record.mime_type,
                            new_display_order,
                            true,
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP
                        );
                        
                        RAISE NOTICE 'Inserted legacy image: %', file_record.original_name;
                    ELSE
                        RAISE NOTICE 'File not found for ID: %', image_id;
                    END IF;
                END;
            END IF;
            
            new_display_order := new_display_order + 1;
        END LOOP;
        
        RAISE NOTICE 'Migration completed. Migrated % images.', new_display_order;
        
    ELSE
        RAISE NOTICE 'No hero images found in page_content table';
    END IF;
    
END $$;

-- Verify the migration
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

-- Optional: Clear the old hero images from page_content (uncomment if you want to remove them)
-- UPDATE page_content 
-- SET content = content - 'heroImages' - 'heroImageIds'
-- WHERE page_name = 'home';
