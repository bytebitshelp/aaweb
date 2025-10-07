-- Fix RLS policies for artworks table
-- This script handles existing policies properly

-- Drop all existing policies for artworks table
DROP POLICY IF EXISTS "Public can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Public can update artworks" ON artworks;
DROP POLICY IF EXISTS "Public can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can update artworks" ON artworks;
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;

-- Create new policies that allow public access
CREATE POLICY "Public can insert artworks" ON artworks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update artworks" ON artworks
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete artworks" ON artworks
  FOR DELETE USING (true);

CREATE POLICY "Anyone can view artworks" ON artworks
  FOR SELECT USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks';
