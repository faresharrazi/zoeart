-- Add missing columns to exhibitions table
-- Run this in your Supabase SQL editor

ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS curator VARCHAR(255),
ADD COLUMN IF NOT EXISTS featured_image TEXT;
