-- Remove MIME type restrictions from artwork-images bucket
-- This allows uploading videos and all image formats
-- Run this in your Supabase SQL Editor

-- Update the bucket to remove file size and MIME type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = NULL,  -- Remove file size limit (or set to a large value like 104857600 for 100MB)
  allowed_mime_types = NULL  -- Remove MIME type restrictions to allow all file types
WHERE name = 'artwork-images';

-- Verify the update
SELECT 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE name = 'artwork-images';

-- Note: If you want to keep a file size limit, you can set it to a large value:
-- file_size_limit = 104857600  -- 100 MB in bytes

