-- ================================================
-- CHECK ARTWORKS TABLE EXISTS AND IS ACCESSIBLE
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Check if artworks table exists
SELECT 
  table_name, 
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'artworks';

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'artworks'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'artworks';

-- 4. List all policies on artworks table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'artworks'
ORDER BY policyname;

-- 5. Check if you can select from artworks
SELECT COUNT(*) as total_artworks FROM artworks;

