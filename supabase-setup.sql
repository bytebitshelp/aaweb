-- Arty Affairs Database Setup Script
-- Run this script in your Supabase SQL Editor

-- Create admin_emails table (separate table for admin access control)
CREATE TABLE IF NOT EXISTS admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
    artwork_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('original', 'resin_art', 'giftable', 'bouquet')),
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    is_original BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('available', 'sold')) DEFAULT 'available',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    order_status TEXT NOT NULL CHECK (order_status IN ('pending', 'dispatched')) DEFAULT 'pending',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
    payment_id TEXT,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
    cart_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workshops table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_upcoming BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interior_design_projects table
CREATE TABLE IF NOT EXISTS interior_design_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    case_study TEXT NOT NULL,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artwork-images', 'artwork-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policies
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE interior_design_projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to artworks
CREATE POLICY "Public can view artworks" ON artworks
    FOR SELECT USING (true);

-- Allow public read access to workshops
CREATE POLICY "Public can view workshops" ON workshops
    FOR SELECT USING (true);

-- Allow public read access to interior design projects
CREATE POLICY "Public can view interior design projects" ON interior_design_projects
    FOR SELECT USING (true);

-- Allow public insert access to artworks (for upload functionality)
CREATE POLICY "Public can insert artworks" ON artworks
    FOR INSERT WITH CHECK (true);

-- Allow public insert access to workshops
CREATE POLICY "Public can insert workshops" ON workshops
    FOR INSERT WITH CHECK (true);

-- Allow public insert access to interior design projects
CREATE POLICY "Public can insert interior design projects" ON interior_design_projects
    FOR INSERT WITH CHECK (true);

-- Admin emails table policies
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- Only allow reading admin emails (for role checking)
CREATE POLICY "Public can view admin emails" ON admin_emails
    FOR SELECT USING (true);

-- Only allow inserting admin emails (for role checking)
CREATE POLICY "Public can insert admin emails" ON admin_emails
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_availability ON artworks(availability_status);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);
CREATE INDEX IF NOT EXISTS idx_workshops_is_upcoming ON workshops(is_upcoming);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON workshops(date);

-- Insert sample admin email (you can add your own admin emails here)
INSERT INTO admin_emails (email, created_by) VALUES
('admin@artyaffairs.com', 'system'),
('your-email@domain.com', 'system'),
('asadmohammed181105@gmail.com', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample data for testing
INSERT INTO artworks (artist_name, title, category, description, price, quantity_available, is_original, status, image_url) VALUES
('Sarah Johnson', 'Forest Dreams', 'original', 'A beautiful acrylic painting capturing the essence of a mystical forest with vibrant greens and golden light.', 299.99, 5, true, 'available', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop'),
('Michael Chen', 'Ocean Waves', 'resin_art', 'Stunning resin art piece with ocean blue tones and metallic accents that shimmer in the light.', 199.99, 3, false, 'available', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop'),
('Emma Rodriguez', 'Sunset Bouquet', 'bouquet', 'Artistic flower arrangement perfect for special occasions with warm sunset colors.', 89.99, 0, false, 'sold', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=500&fit=crop'),
('David Park', 'Gift Hamper Deluxe', 'giftable', 'Premium gift hamper with art supplies, handmade items, and a beautiful custom artwork.', 149.99, 2, false, 'available', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop');

INSERT INTO workshops (name, description, date, is_upcoming, image_url) VALUES
('Watercolor Painting for Beginners', 'Learn the basics of watercolor painting with professional artist Sarah Johnson. Perfect for beginners who want to explore this beautiful medium.', '2024-02-15T10:00:00Z', true, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop'),
('Resin Art Masterclass', 'Advanced techniques in resin art with Michael Chen. Learn to create stunning pieces with metallic accents and unique textures.', '2024-02-22T14:00:00Z', true, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop'),
('Oil Painting Fundamentals', 'Master the basics of oil painting with professional techniques.', '2024-01-20T10:00:00Z', false, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop');

INSERT INTO interior_design_projects (title, description, case_study, image_urls) VALUES
('Modern Living Room Transformation', 'Complete living room makeover with contemporary art pieces and minimalist design.', 'This project involved transforming a traditional living room into a modern, art-focused space. We selected bold abstract paintings and sleek sculptures to create visual interest while maintaining functionality.', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop']),
('Bohemian Bedroom Retreat', 'Eclectic bedroom design featuring vibrant artwork and natural textures.', 'A creative approach to bedroom design that combines bohemian aesthetics with carefully curated art pieces. The result is a personal sanctuary that reflects the client''s artistic personality.', ARRAY['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop']);

-- Grant necessary permissions for storage
CREATE POLICY "Public can view artwork images" ON storage.objects
    FOR SELECT USING (bucket_id = 'artwork-images');

CREATE POLICY "Public can upload artwork images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'artwork-images');

CREATE POLICY "Public can update artwork images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'artwork-images');
