-- Add visibility columns to all content tables
-- This allows admins to control which items are shown on the public website

-- Add visibility column to artworks table
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add visibility column to artists table  
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add visibility column to exhibitions table
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Update existing records to be visible by default
UPDATE artworks SET is_visible = true WHERE is_visible IS NULL;
UPDATE artists SET is_visible = true WHERE is_visible IS NULL;
UPDATE exhibitions SET is_visible = true WHERE is_visible IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artworks_visibility ON artworks(is_visible);
CREATE INDEX IF NOT EXISTS idx_artists_visibility ON artists(is_visible);
CREATE INDEX IF NOT EXISTS idx_exhibitions_visibility ON exhibitions(is_visible);
