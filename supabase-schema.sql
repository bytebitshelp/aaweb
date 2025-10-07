-- Arty Affairs Database Schema
-- Updated with proper constraints and relationships

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Emails Table (for managing admin access)
CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artworks Table
CREATE TABLE IF NOT EXISTS artworks (
  artwork_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Original', 'Resin', 'Giftable', 'Bouquet', 'Crochet', 'Ceramic')) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity_available INT DEFAULT 1,
  is_original BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('Available', 'Sold')) DEFAULT 'Available',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('Pending', 'Paid', 'Failed')) DEFAULT 'Pending',
  order_status TEXT CHECK (order_status IN ('Pending', 'Dispatched')) DEFAULT 'Pending',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
  cart_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, artwork_id)
);

-- Insert default admin user
INSERT INTO users (user_id, email, name, role) 
VALUES (gen_random_uuid(), 'asadmohammed181105@gmail.com', 'Admin User', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Insert admin email for access control
INSERT INTO admin_emails (email, is_active) 
VALUES ('asadmohammed181105@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for artworks table
CREATE POLICY "Anyone can view artworks" ON artworks
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert artworks" ON artworks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update artworks" ON artworks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for orders table
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for cart table
CREATE POLICY "Users can manage own cart" ON cart
  FOR ALL USING (user_id::text = auth.uid()::text);

-- Function to automatically update artwork status when quantity reaches 0
CREATE OR REPLACE FUNCTION update_artwork_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If quantity becomes 0 and it's an original artwork, mark as sold
  IF NEW.quantity_available <= 0 AND NEW.is_original = true THEN
    NEW.status := 'Sold';
  ELSIF NEW.quantity_available > 0 THEN
    NEW.status := 'Available';
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update artwork status
CREATE TRIGGER trigger_update_artwork_status
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_status();

-- Function to update order updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO artworks (artist_name, title, category, description, price, quantity_available, is_original, image_url) VALUES
('John Doe', 'Sunset Dreams', 'Original', 'A beautiful original painting capturing the essence of sunset', 299.99, 1, true, '/sample-artwork-1.jpg'),
('Jane Smith', 'Ocean Waves', 'Resin', 'Stunning resin art with ocean wave patterns', 149.99, 5, false, '/sample-artwork-2.jpg'),
('Mike Johnson', 'Floral Bouquet', 'Bouquet', 'Handcrafted floral arrangement perfect for gifting', 79.99, 10, false, '/sample-artwork-3.jpg'),
('Sarah Wilson', 'Custom Gift Box', 'Giftable', 'Beautifully wrapped gift box with custom artwork', 49.99, 20, false, '/sample-artwork-4.jpg')
ON CONFLICT DO NOTHING;
