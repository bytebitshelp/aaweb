-- Script to fix RLS policies for artworks table
-- This allows public access to artworks table for the admin dashboard

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can update artworks" ON artworks;

-- Create new policies that allow public access
CREATE POLICY "Public can insert artworks" ON artworks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update artworks" ON artworks
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete artworks" ON artworks
  FOR DELETE USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks';
