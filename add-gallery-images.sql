-- Add gallery_images column to exhibitions table
-- Run this in your Supabase SQL editor

ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
