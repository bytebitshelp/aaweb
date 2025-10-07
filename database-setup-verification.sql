-- Database Setup Verification Script for Arty Affairs
-- Run this in your Supabase SQL Editor to verify and complete the database setup

-- 1. Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'artworks', 'orders', 'cart', 'admin_emails', 'workshops', 'interior_design_projects') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'artworks', 'orders', 'cart', 'admin_emails', 'workshops', 'interior_design_projects')
ORDER BY table_name;

-- 2. Create admin_emails table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Insert admin email if it doesn't exist
INSERT INTO admin_emails (email, is_active) 
VALUES ('asadmohammed181105@gmail.com', true) 
ON CONFLICT (email) DO NOTHING;

-- 4. Verify admin email exists
SELECT 
    email, 
    is_active, 
    created_at,
    CASE WHEN email = 'asadmohammed181105@gmail.com' THEN '✅ ADMIN EMAIL READY' ELSE '⚠️ OTHER EMAIL' END as status
FROM admin_emails 
WHERE is_active = true;

-- 5. Check if artworks table has correct categories
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'artworks' 
AND column_name IN ('category', 'status', 'availability_status')
ORDER BY column_name;

-- 6. Check RLS policies (if any)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'artworks', 'orders', 'cart', 'admin_emails')
ORDER BY tablename, policyname;

-- 7. Test insert permissions (run this as authenticated user)
-- This will help verify if RLS is working correctly
-- Note: This should be run after authentication is working

-- 8. Sample data check
SELECT 
    'artworks' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_count,
    COUNT(CASE WHEN status = 'Sold' THEN 1 END) as sold_count
FROM artworks
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count
FROM users;

-- 9. Verify authentication setup
-- Check if auth.users table exists (this is managed by Supabase)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
        THEN '✅ Supabase Auth is properly configured'
        ELSE '❌ Supabase Auth is not configured'
    END as auth_status;
