-- Script to fix RLS policies for artworks table
-- This allows public access to artworks table for the admin dashboard

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks';

-- Drop ALL existing policies for artworks table to avoid conflicts
DROP POLICY IF EXISTS "Only admins can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can update artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Public can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Public can update artworks" ON artworks;
DROP POLICY IF EXISTS "Public can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
DROP POLICY IF EXISTS "Public can view artworks" ON artworks;
DROP POLICY IF EXISTS "Authenticated users can view artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can view all artworks" ON artworks;
DROP POLICY IF EXISTS "Users can view artworks" ON artworks;

-- IMPORTANT: Create SELECT policy first - this is needed to VIEW artworks
-- This allows anyone (including anonymous users) to view artworks
CREATE POLICY "Anyone can view artworks" ON artworks
  FOR SELECT 
  TO public, anon, authenticated
  USING (true);

-- Create new policies that allow public access for mutations
CREATE POLICY "Public can insert artworks" ON artworks
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update artworks" ON artworks
  FOR UPDATE 
  TO public, anon, authenticated
  USING (true);

CREATE POLICY "Public can delete artworks" ON artworks
  FOR DELETE 
  TO public, anon, authenticated
  USING (true);

-- Verify the policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks'
ORDER BY cmd, policyname;
