-- ================================================
-- FIX UPLOAD INSERT - TEMPORARY SOLUTION
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Drop all existing RLS policies on artworks
DROP POLICY IF EXISTS "Enable read for all users" ON artworks;
DROP POLICY IF EXISTS "Enable insert for admin users" ON artworks;
DROP POLICY IF EXISTS "Enable update for admin users" ON artworks;
DROP POLICY IF EXISTS "Enable delete for admin users" ON artworks;
DROP POLICY IF EXISTS "Enable read access to artworks" ON artworks;
DROP POLICY IF EXISTS "Enable insert access to artworks" ON artworks;

-- 2. Allow public read access
CREATE POLICY "Public read access" ON artworks
  FOR SELECT
  TO public
  USING (true);

-- 3. Allow authenticated users to insert (TEMPORARY - for testing)
CREATE POLICY "Authenticated users can insert" ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Allow authenticated users to update their own or all
CREATE POLICY "Authenticated users can update" ON artworks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON artworks
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'artworks';

