-- Add file_data column to uploaded_files table for storing binary file data
-- This allows storing files directly in PostgreSQL database using BYTEA

ALTER TABLE uploaded_files 
ADD COLUMN IF NOT EXISTS file_data BYTEA;

-- Add comment to explain the column
COMMENT ON COLUMN uploaded_files.file_data IS 'Binary file data stored directly in database using BYTEA';

-- Optional: Remove the url column if it exists (since we're using API endpoints now)
-- ALTER TABLE uploaded_files DROP COLUMN IF EXISTS url;