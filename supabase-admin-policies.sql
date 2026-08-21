-- Run in Supabase SQL editor (Dashboard → SQL).
-- Uses the signed-in email from the JWT so policies do not recurse on the users table.

-- Catalog is public
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
CREATE POLICY "Anyone can view artworks" ON artworks
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Authenticated users can update artworks" ON artworks;
DROP POLICY IF EXISTS "Authenticated users can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can update artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can delete artworks" ON artworks;
DROP POLICY IF EXISTS "Public can insert artworks" ON artworks;

CREATE POLICY "Authenticated users can insert artworks" ON artworks
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update artworks" ON artworks
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete artworks" ON artworks
  FOR DELETE TO authenticated USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all users by email" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all users by email" ON users
  FOR SELECT TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'admin@artyaffairs.com');

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'admin@artyaffairs.com');

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'admin@artyaffairs.com');

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON workshops TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view workshops" ON workshops;
DROP POLICY IF EXISTS "Anyone can view workshops" ON workshops;
DROP POLICY IF EXISTS "Public can insert workshops" ON workshops;
DROP POLICY IF EXISTS "Public can update workshops" ON workshops;
DROP POLICY IF EXISTS "Public can delete workshops" ON workshops;
DROP POLICY IF EXISTS "Authenticated users can insert workshops" ON workshops;
DROP POLICY IF EXISTS "Authenticated users can update workshops" ON workshops;
DROP POLICY IF EXISTS "Authenticated users can delete workshops" ON workshops;

CREATE POLICY "Anyone can view workshops" ON workshops
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Public can insert workshops" ON workshops
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update workshops" ON workshops
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete workshops" ON workshops
  FOR DELETE TO anon, authenticated USING (true);
