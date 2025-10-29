-- Fix Infinite Recursion in Users Table RLS Policies
-- This script fixes the infinite recursion issue when RLS policies query the users table

-- ============================================
-- Step 1: Drop existing problematic policies
-- ============================================

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- ============================================
-- Step 2: Create a security definer function to check admin status
-- ============================================

-- This function bypasses RLS to check if a user is an admin
-- It uses SECURITY DEFINER to run with elevated privileges and bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- This query bypasses RLS because the function runs as SECURITY DEFINER
  -- and the function owner should have full access to the users table
  SELECT role INTO user_role
  FROM public.users
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Important: Ensure the function owner can access users table
-- Grant necessary permissions to the function (it runs as the function owner)
-- The postgres superuser should be able to read all tables, but let's make it explicit

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ============================================
-- Step 3: Create fixed RLS policies for users table
-- ============================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own profile (for new sign-ups)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- Allow admins to view all users (using the function to avoid recursion)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- Step 4: Fix policies on other tables that query users
-- ============================================

-- Fix artworks policies
DROP POLICY IF EXISTS "Only admins can insert artworks" ON artworks;
CREATE POLICY "Only admins can insert artworks" ON artworks
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update artworks" ON artworks;
CREATE POLICY "Only admins can update artworks" ON artworks
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can delete artworks" ON artworks;
CREATE POLICY "Only admins can delete artworks" ON artworks
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Fix orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Fix cart policies (check if needed)
-- These should already be fine, but verify they're correct
DROP POLICY IF EXISTS "Admins can view all cart items" ON cart;
CREATE POLICY "Admins can view all cart items" ON cart
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- Step 5: Verify the setup
-- ============================================

-- Test query to verify function works (should return boolean)
SELECT public.is_admin(auth.uid()) as is_current_user_admin;

-- Check all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'artworks', 'orders', 'cart')
ORDER BY tablename, policyname;

