-- Update Artworks Table for Multiple Images Support
-- Run this in your Supabase SQL Editor

-- Step 1: Add image_urls array column (to store multiple image URLs)
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Step 2: Migrate existing image_url data to image_urls array
-- (Keep image_url as fallback for backwards compatibility)
UPDATE artworks 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Step 3: Create index for faster queries on image_urls
CREATE INDEX IF NOT EXISTS idx_artworks_image_urls ON artworks USING GIN (image_urls);

-- Step 4: Add a comment to explain the new column
COMMENT ON COLUMN artworks.image_urls IS 'Array of image URLs for the artwork carousel';

-- Verify the update
SELECT 
  artwork_id, 
  title, 
  image_url, 
  image_urls, 
  array_length(image_urls, 1) as image_count
FROM artworks 
LIMIT 5;

