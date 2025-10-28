-- ================================================
-- PRODUCTION READY DEPLOYMENT SCRIPT
-- Arty Affairs - Complete Database Setup
-- Run this in your Supabase SQL Editor
-- ================================================

-- ================================================
-- 1. VERIFY CURRENT SCHEMA
-- ================================================
-- Check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ================================================
-- 2. UPDATE ARTWORKS TABLE FOR MULTIPLE IMAGES
-- ================================================
-- Add image_urls column if it doesn't exist
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Migrate existing image_url data to image_urls array
UPDATE artworks 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Create GIN index for faster queries on image_urls
CREATE INDEX IF NOT EXISTS idx_artworks_image_urls 
ON artworks USING GIN (image_urls);

-- Add comment
COMMENT ON COLUMN artworks.image_urls IS 'Array of image URLs for the artwork carousel';

-- ================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ================================================
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 4. CREATE OR UPDATE RLS POLICIES FOR ARTWORKS
-- ================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for all users" ON artworks;
DROP POLICY IF EXISTS "Enable insert for admin users" ON artworks;
DROP POLICY IF EXISTS "Enable update for admin users" ON artworks;
DROP POLICY IF EXISTS "Enable delete for admin users" ON artworks;

-- Public read access
CREATE POLICY "Enable read for all users" ON artworks
  FOR SELECT
  TO public
  USING (true);

-- Admin insert access
CREATE POLICY "Enable insert for admin users" ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin update access
CREATE POLICY "Enable update for admin users" ON artworks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin delete access
CREATE POLICY "Enable delete for admin users" ON artworks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ================================================
-- 5. CREATE OR UPDATE RLS POLICIES FOR ORDERS
-- ================================================
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all orders
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

-- Users can insert their own orders
CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ================================================
-- 6. CREATE OR UPDATE RLS POLICIES FOR USERS
-- ================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.user_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- ================================================
-- 7. CREATE OR UPDATE RLS POLICIES FOR CART
-- ================================================
DROP POLICY IF EXISTS "Users can manage their own cart" ON cart;
DROP POLICY IF EXISTS "Admins can view all cart items" ON cart;

CREATE POLICY "Users can manage their own cart" ON cart
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

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

-- ================================================
-- 8. CREATE PERFORMANCE INDEXES
-- ================================================
-- Artworks indexes
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);

-- Orders indexes (using order_date, not created_at)
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_artwork_id ON orders(artwork_id);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_artwork_id ON cart(artwork_id);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_artworks_category_status ON artworks(category, status);
CREATE INDEX IF NOT EXISTS idx_orders_statuses ON orders(payment_status, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_order_date ON orders(user_id, order_date DESC);

-- ================================================
-- 9. SET ADMIN USER
-- ================================================
UPDATE users 
SET role = 'admin' 
WHERE email = 'asadmohammed181105@gmail.com';

-- ================================================
-- 10. VERIFY SETUP
-- ================================================
-- Check artworks table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'artworks'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('artworks', 'orders', 'users', 'cart');

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check admin user
SELECT user_id, name, email, role 
FROM users 
WHERE role = 'admin';

-- Check image_urls migration
SELECT 
  artwork_id, 
  title, 
  image_url, 
  image_urls, 
  array_length(image_urls, 1) as image_count
FROM artworks 
LIMIT 5;

-- ================================================
-- SETUP COMPLETE!
-- ================================================

