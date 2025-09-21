-- Fix Storage Bucket RLS Policies
-- Run this in your Supabase SQL Editor

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to gallery-images bucket
CREATE POLICY "Public read access for gallery-images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');

-- Create policy to allow public insert access to gallery-images bucket
CREATE POLICY "Public insert access for gallery-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

-- Create policy to allow public update access to gallery-images bucket
CREATE POLICY "Public update access for gallery-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'gallery-images');

-- Create policy to allow public delete access to gallery-images bucket
CREATE POLICY "Public delete access for gallery-images" ON storage.objects
FOR DELETE USING (bucket_id = 'gallery-images');

-- Alternative: If you want to allow all operations on all buckets (less secure)
-- CREATE POLICY "Allow all operations on storage objects" ON storage.objects
-- FOR ALL USING (true);
