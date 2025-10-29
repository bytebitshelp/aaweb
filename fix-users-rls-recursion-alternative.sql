-- Alternative Fix: Use admin_emails table instead of users table for admin checks
-- This completely avoids querying the users table in policies

-- ============================================
-- Step 1: Drop existing problematic policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Drop policies that query users table
DROP POLICY IF EXISTS "Only admins can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can update artworks" ON artworks;
DROP POLICY IF EXISTS "Only admins can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all cart items" ON cart;

-- ============================================
-- Step 2: Create function to check admin using admin_emails table
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_email TEXT;
  is_admin_user BOOLEAN;
BEGIN
  -- Get user email from auth.users (this bypasses RLS)
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if email is in admin_emails table
  SELECT EXISTS (
    SELECT 1 FROM admin_emails 
    WHERE email = user_email 
    AND is_active = true
  ) INTO is_admin_user;
  
  RETURN COALESCE(is_admin_user, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- Step 3: Create fixed RLS policies for users table
-- ============================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (public.is_admin());

-- ============================================
-- Step 4: Fix policies on other tables using the new function
-- ============================================

-- Artworks policies
CREATE POLICY "Only admins can insert artworks" ON artworks
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update artworks" ON artworks
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete artworks" ON artworks
  FOR DELETE
  USING (public.is_admin());

-- Orders policies
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (public.is_admin());

-- Cart policies
CREATE POLICY "Admins can view all cart items" ON cart
  FOR SELECT
  USING (public.is_admin());

