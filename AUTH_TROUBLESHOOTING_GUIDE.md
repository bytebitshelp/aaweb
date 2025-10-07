# Authentication Troubleshooting Guide

## Issues Identified and Fixed

### 1. ✅ **Environment Variables Setup**
**Problem**: Missing `.env` file with Supabase credentials
**Solution**: Create `.env` file in project root with the following content:

```env
VITE_SUPABASE_URL=https://ibgztilnaecjexshxmrz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo

# Razorpay Configuration (Add your Razorpay keys here)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Google OAuth Configuration (Configure in Supabase Dashboard)
# Go to Supabase Dashboard > Authentication > Providers > Google
# Enable Google provider and add your Google OAuth credentials

# Admin User Credentials
# Email: asadmohammed181105@gmail.com
# Password: 123456789
# Role: admin (automatically assigned based on email)
```

### 2. ✅ **AuthContext Syntax Error Fixed**
**Problem**: Missing proper indentation in `checkAdminStatus` function
**Solution**: Fixed indentation and structure

### 3. ✅ **Database Column Consistency**
**Problem**: Some pages were using `availability_status` instead of `status`
**Solution**: Updated all database queries to use `status` field consistently

## Manual Steps Required

### Step 1: Create .env File
1. Create a `.env` file in your project root directory
2. Copy the content from `supabase-config.env` into the `.env` file
3. Make sure the file is named exactly `.env` (not `.env.txt` or similar)

### Step 2: Verify Supabase Database Setup
Run the following SQL in your Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'artworks', 'orders', 'cart', 'admin_emails');

-- Check if admin email exists
SELECT * FROM admin_emails WHERE email = 'asadmohammed181105@gmail.com';

-- If admin_emails table is empty, insert admin email
INSERT INTO admin_emails (email, is_active) 
VALUES ('asadmohammed181105@gmail.com', true) 
ON CONFLICT (email) DO NOTHING;
```

### Step 3: Test Authentication
1. Start the development server: `npm run dev`
2. Try to sign in with:
   - **Admin Email**: `asadmohammed181105@gmail.com`
   - **Password**: `123456789`
3. Check browser console for any errors
4. Verify user is redirected to admin dashboard

### Step 4: Google OAuth Setup (Optional)
If you want Google sign-in to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Go to Supabase Dashboard > Authentication > Providers
7. Enable Google provider
8. Add your Google OAuth credentials

## Common Authentication Issues

### Issue 1: "Invalid login credentials"
**Causes**:
- Wrong email/password
- User doesn't exist in Supabase Auth
- Email not confirmed (if email confirmation is enabled)

**Solutions**:
- Verify credentials
- Check Supabase Auth users table
- Disable email confirmation in Supabase settings if needed

### Issue 2: "User not found in users table"
**Causes**:
- User exists in Supabase Auth but not in custom users table
- Database connection issues

**Solutions**:
- Check database connection
- Verify RLS policies
- Check if user profile creation is working

### Issue 3: "Admin access denied"
**Causes**:
- Email not in admin_emails table
- is_active is false
- checkAdminStatus function error

**Solutions**:
- Add email to admin_emails table
- Set is_active to true
- Check browser console for errors

### Issue 4: "Session not persisting"
**Causes**:
- localStorage issues
- Supabase session configuration
- Browser settings

**Solutions**:
- Check browser localStorage
- Verify Supabase auth settings
- Clear browser cache and try again

## Testing Checklist

- [ ] .env file exists and has correct values
- [ ] Supabase database tables are created
- [ ] Admin email is in admin_emails table
- [ ] Can sign up new users
- [ ] Can sign in existing users
- [ ] Admin users are redirected to admin dashboard
- [ ] Customer users are redirected to home page
- [ ] Session persists on page refresh
- [ ] Sign out works correctly
- [ ] Google OAuth works (if configured)

## Debug Commands

```bash
# Check if .env file exists
ls -la | grep .env

# Check environment variables are loaded
npm run dev
# Look for console logs showing Supabase URL

# Test database connection
# Open browser console and run:
# supabase.from('users').select('count').then(console.log)
```

## Support

If you're still having issues:
1. Check browser console for errors
2. Check Supabase dashboard logs
3. Verify all environment variables are loaded
4. Test with a fresh browser session
5. Ensure database tables have proper RLS policies
