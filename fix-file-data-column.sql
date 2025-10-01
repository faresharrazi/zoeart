-- Fix file_data column in uploaded_files table for PostgreSQL
-- This script handles the case where the column might not exist or have issues

-- First, check if the column exists and drop it if it has issues
DO $$ 
BEGIN
    -- Check if file_data column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'uploaded_files' 
        AND column_name = 'file_data'
    ) THEN
        -- Column exists, check if it's the right type
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'uploaded_files' 
            AND column_name = 'file_data'
            AND data_type = 'bytea'
        ) THEN
            -- Wrong type, drop and recreate
            ALTER TABLE uploaded_files DROP COLUMN file_data;
            ALTER TABLE uploaded_files ADD COLUMN file_data BYTEA;
            RAISE NOTICE 'Recreated file_data column with correct BYTEA type';
        ELSE
            RAISE NOTICE 'file_data column already exists with correct BYTEA type';
        END IF;
    ELSE
        -- Column doesn't exist, create it
        ALTER TABLE uploaded_files ADD COLUMN file_data BYTEA;
        RAISE NOTICE 'Created file_data column with BYTEA type';
    END IF;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN uploaded_files.file_data IS 'Binary file data stored directly in database using BYTEA';

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'uploaded_files' 
ORDER BY ordinal_position;
