-- Fix Admin Dashboard Access
-- Run this in your Supabase SQL Editor

-- 1. Check if tables exist and are accessible
SELECT 
  table_name,
  table_type
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
  AND table_name IN ('orders', 'artworks', 'users', 'cart')
ORDER BY 
  table_name;

-- 2. Create permissive policies for admin dashboard access
-- These policies allow admins to read all data

-- Orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Artworks policies  
DROP POLICY IF EXISTS "Admins can view all artworks" ON artworks;
CREATE POLICY "Admins can view all artworks" ON artworks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.user_id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Cart policies
DROP POLICY IF EXISTS "Admins can view all cart items" ON cart;
CREATE POLICY "Admins can view all cart items" ON cart
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 3. Also allow anonymous access for public data (optional)
DROP POLICY IF EXISTS "Anyone can view available artworks" ON artworks;
CREATE POLICY "Anyone can view available artworks" ON artworks
  FOR SELECT
  TO anon, authenticated
  USING (status = 'Available' OR status = 'available');

-- 4. Update existing user to be admin (replace with your actual email)
UPDATE users 
SET role = 'admin' 
WHERE email = 'asadmohammed181105@gmail.com';

-- 5. Check the current admin user
SELECT user_id, name, email, role, created_at 
FROM users 
WHERE role = 'admin';

