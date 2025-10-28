-- Performance Indexes for Arty Affairs Database
-- Run this SQL in your Supabase SQL Editor to improve query performance

-- ============================================
-- INDEXES FOR ARTWORKS TABLE
-- ============================================
-- Use created_at only if it exists; otherwise skip
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'artworks' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC)';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_quantity ON artworks(quantity_available);

-- ============================================
-- INDEXES FOR ORDERS TABLE
-- ============================================
-- Orders table uses order_date in this schema; create index on that
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC)';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_artwork_id ON orders(artwork_id);

-- ============================================
-- INDEXES FOR USERS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Use created_at only if it exists; otherwise skip
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)';
  END IF;
END $$;

-- ============================================
-- COMPOSITE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================
-- For filtering artworks by category and status
CREATE INDEX IF NOT EXISTS idx_artworks_category_status ON artworks(category, status);

-- For filtering orders by payment and order status
CREATE INDEX IF NOT EXISTS idx_orders_statuses ON orders(payment_status, order_status);

-- For finding recent orders by user
-- Create composite index using order_date if available; otherwise skip
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_user_order_date ON orders(user_id, order_date DESC)';
  END IF;
END $$;

-- ============================================
-- STATISTICS UPDATE
-- ============================================
-- Update table statistics for query planner optimization
ANALYZE artworks;
ANALYZE orders;
ANALYZE users;

-- ============================================
-- COMMENTS
-- ============================================
-- Comment only if index exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'idx_artworks_created_at'
  ) THEN
    EXECUTE 'COMMENT ON INDEX idx_artworks_created_at IS ''Speeds up ordering by creation date''';
  END IF;
END $$;
COMMENT ON INDEX idx_artworks_category IS 'Speeds up category filtering';
-- Comment only if index exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'idx_orders_order_date'
  ) THEN
    EXECUTE 'COMMENT ON INDEX idx_orders_order_date IS ''Speeds up recent orders queries''';
  END IF;
END $$;
COMMENT ON INDEX idx_orders_payment_status IS 'Speeds up payment filtering';
COMMENT ON INDEX idx_users_email IS 'Speeds up email lookups';

