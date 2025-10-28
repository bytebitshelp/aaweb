-- ================================================
-- BYPASS RLS FOR TESTING
-- Run this in Supabase SQL Editor to allow inserts
-- ================================================

-- 1. Disable RLS temporarily for testing
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'artworks';

-- 3. Test insert works (optional - you can run this to verify)
-- INSERT INTO artworks (artist_name, title, category, description, price, quantity_available, status, is_original, image_url, created_at) 
-- VALUES ('Test Artist', 'Test Artwork', 'original', 'Test description', 1000, 1, 'available', true, 'https://example.com/image.jpg', NOW());

-- NOTE: After testing works, you can re-enable RLS with:
-- ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
-- And then run FIX_UPLOAD_INSERT.sql to set up proper policies

