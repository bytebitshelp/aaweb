-- Fix Supabase Storage Bucket Policies for artwork-images
-- Run this in your Supabase SQL Editor

-- First, check if the bucket exists
SELECT name, public 
FROM storage.buckets 
WHERE name = 'artwork-images';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('artwork-images', 'artwork-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (drop ALL possible policy names)
DROP POLICY IF EXISTS "Public can view artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete artwork images" ON storage.objects;

-- Create policy to allow public viewing of images
CREATE POLICY "Public can view artwork images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artwork-images');

-- Create policy to allow anyone (including anonymous) to upload images
-- This ensures uploads work even without authentication
CREATE POLICY "Anyone can upload artwork images"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (
  bucket_id = 'artwork-images' AND
  (storage.foldername(name))[1] = 'artworks'
);

-- Create policy to allow anyone to update images
CREATE POLICY "Anyone can update artwork images"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'artwork-images')
WITH CHECK (bucket_id = 'artwork-images');

-- Create policy to allow anyone to delete images
CREATE POLICY "Anyone can delete artwork images"
ON storage.objects FOR DELETE
TO public, anon, authenticated
USING (bucket_id = 'artwork-images');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%artwork%'
ORDER BY policyname;

