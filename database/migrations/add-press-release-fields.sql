-- Add press release fields to exhibitions table

-- Add press_media_name column
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS press_media_name VARCHAR(255);

-- Add press_media_link column  
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS press_media_link VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN exhibitions.press_media_name IS 'Name/title of the press release document';
COMMENT ON COLUMN exhibitions.press_media_link IS 'Download link for the press release PDF';

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'exhibitions' 
AND column_name IN ('press_media_name', 'press_media_link');
