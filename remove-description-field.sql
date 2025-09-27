-- Remove description field from about_blocks table
ALTER TABLE about_blocks DROP COLUMN IF EXISTS description;
