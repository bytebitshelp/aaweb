-- Fix image_urls column to handle multiple URLs properly
-- This prevents "index row requires X bytes, maximum size is 8191" error
-- Run this in your Supabase SQL Editor

-- Step 1: Check current column type
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'artworks' 
  AND column_name IN ('image_url', 'image_urls');

-- Step 2: Drop any indexes on image_urls that might cause size issues
DROP INDEX IF EXISTS idx_artworks_image_urls;

-- Step 3: If image_urls doesn't exist, add it as TEXT (not TEXT[] to avoid index issues)
-- TEXT can store JSON strings or arrays as text
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS image_urls TEXT;

-- Step 4: If image_urls is TEXT[], convert it to TEXT to avoid index size limits
-- (This preserves existing data by converting array to JSON string)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artworks' 
    AND column_name = 'image_urls' 
    AND data_type = 'ARRAY'
  ) THEN
    -- First, create a temporary column to store the JSON string
    ALTER TABLE artworks ADD COLUMN IF NOT EXISTS image_urls_temp TEXT;
    
    -- Convert array to JSON string and store in temp column
    -- Cast the array column directly - no need for double casting
    UPDATE artworks 
    SET image_urls_temp = array_to_json(image_urls)::text
    WHERE image_urls IS NOT NULL;
    
    -- Drop the old array column
    ALTER TABLE artworks DROP COLUMN image_urls;
    
    -- Rename temp column to image_urls
    ALTER TABLE artworks RENAME COLUMN image_urls_temp TO image_urls;
  END IF;
END $$;

-- Step 5: Ensure image_url column exists (for backwards compatibility)
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 6: Remove any indexes on image_url that might cause issues
-- (TEXT columns with indexes have size limits)
DROP INDEX IF EXISTS idx_artworks_image_url;

-- Step 7: Verify the column types
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'artworks' 
  AND column_name IN ('image_url', 'image_urls')
ORDER BY column_name;

-- Note: 
-- - image_urls will store JSON array as text: ["url1", "url2", ...]
-- - This avoids index size limits while still allowing multiple URLs
-- - The application code handles JSON parsing when reading the data

