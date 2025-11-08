-- Fix RLS policies for artworks table to allow viewing
-- Run this in your Supabase SQL Editor

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks';

-- Drop all existing SELECT policies for artworks table to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
DROP POLICY IF EXISTS "Public can view artworks" ON artworks;
DROP POLICY IF EXISTS "Authenticated users can view artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can view all artworks" ON artworks;
DROP POLICY IF EXISTS "Users can view artworks" ON artworks;

-- Create a permissive SELECT policy that allows anyone (including anonymous) to view artworks
-- This is needed for the admin dashboard and public shop pages
CREATE POLICY "Anyone can view artworks" ON artworks
  FOR SELECT 
  TO public, anon, authenticated
  USING (true);

-- Also ensure INSERT, UPDATE, DELETE policies exist for admins (if needed)
-- Drop existing policies first
DROP POLICY IF EXISTS "Only admins can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can update artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Public can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Public can update artworks" ON artworks;
DROP POLICY IF EXISTS "Public can delete artworks" ON artworks;

-- Create admin-only policies for mutations
-- These check if user exists in users table with admin role
CREATE POLICY "Admins can insert artworks" ON artworks
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE admin_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_emails.is_active = true
    )
  );

CREATE POLICY "Admins can update artworks" ON artworks
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE admin_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_emails.is_active = true
    )
  );

CREATE POLICY "Admins can delete artworks" ON artworks
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE admin_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_emails.is_active = true
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'artworks'
ORDER BY cmd, policyname;

