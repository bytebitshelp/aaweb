-- ================================================
-- REINITIALIZE DATABASE - Complete Setup
-- Run this in Supabase SQL Editor
-- ================================================

-- ================================================
-- 1. DROP EXISTING TABLES (CAREFUL - THIS DELETES ALL DATA)
-- ================================================
-- Uncomment these if you want to start fresh
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS cart CASCADE;
-- DROP TABLE IF EXISTS artworks CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS workshops CASCADE;
-- DROP TABLE IF EXISTS interior_design_projects CASCADE;
-- DROP TABLE IF EXISTS admin_emails CASCADE;

-- ================================================
-- 2. CREATE USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. CREATE ARTWORKS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS artworks (
  artwork_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('original', 'resin_art', 'giftable', 'bouquet', 'crochet', 'ceramic')),
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 1,
  is_original BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('available', 'sold')) DEFAULT 'available',
  image_url TEXT,
  image_urls TEXT[], -- Array for multiple images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 4. CREATE ORDERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  order_status TEXT NOT NULL CHECK (order_status IN ('pending', 'dispatched')) DEFAULT 'pending',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
  payment_id TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. CREATE CART TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS cart (
  cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_image_urls ON artworks USING GIN (image_urls);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- ================================================
-- 7. ENABLE RLS
-- ================================================
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 8. CREATE RLS POLICIES FOR ARTWORKS
-- ================================================
-- Allow public read access
DROP POLICY IF EXISTS "Public read access" ON artworks;
CREATE POLICY "Public read access" ON artworks
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert
DROP POLICY IF EXISTS "Authenticated users can insert" ON artworks;
CREATE POLICY "Authenticated users can insert" ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update
DROP POLICY IF EXISTS "Authenticated users can update" ON artworks;
CREATE POLICY "Authenticated users can update" ON artworks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Authenticated users can delete" ON artworks;
CREATE POLICY "Authenticated users can delete" ON artworks
  FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- 9. CREATE RLS POLICIES FOR ORDERS
-- ================================================
-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ================================================
-- 10. CREATE RLS POLICIES FOR CART
-- ================================================
DROP POLICY IF EXISTS "Users can manage their own cart" ON cart;
CREATE POLICY "Users can manage their own cart" ON cart
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ================================================
-- 11. INSERT TEST ADMIN USER
-- ================================================
INSERT INTO users (user_id, name, email, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'Admin User', 'asadmohammed181105@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- ================================================
-- 12. VERIFY SETUP
-- ================================================
SELECT 'artworks' as table_name, COUNT(*) as row_count FROM artworks
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'cart', COUNT(*) FROM cart;

SELECT 'RLS Status' as check_type, 
       tablename, 
       rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('artworks', 'orders', 'users', 'cart');

