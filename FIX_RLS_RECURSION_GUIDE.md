# Fix RLS Infinite Recursion Error

## 🐛 Problem

You're experiencing this error:
```
infinite recursion detected in policy for relation "users"
Assignment code: '42P17'
```

## 🔍 Root Cause

The RLS policies on other tables (artworks, orders, cart) are querying the `users` table to check if a user is an admin. When these policies execute, they trigger RLS checks on the `users` table, which in turn can trigger more checks, creating infinite recursion.

Example of problematic policy:
```sql
CREATE POLICY "Only admins can insert artworks" ON artworks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );
```

## ✅ Solution

Use **`fix-users-rls-recursion-alternative.sql`** (RECOMMENDED)

This solution:
1. Uses `auth.users` table (Supabase's auth system, not our public.users table)
2. Uses `admin_emails` table for admin checks (no RLS recursion)
3. Creates a `SECURITY DEFINER` function that bypasses RLS

### Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to SQL Editor

2. **Run the Fix Script**
   - Copy the contents of `fix-users-rls-recursion-alternative.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify the Fix**
   - Try logging in again
   - Try adding items to cart
   - Check that user profile creation works

## 📋 What the Fix Does

### 1. Creates `is_admin()` Function
This function:
- Gets the user's email from `auth.users` (bypasses RLS)
- Checks if the email exists in `admin_emails` table
- Returns true/false without querying `public.users` table

### 2. Fixes RLS Policies
- **Users table**: Allows users to insert/update/view their own profile
- **Artworks table**: Uses `is_admin()` function instead of querying users
- **Orders table**: Uses `is_admin()` function instead of querying users
- **Cart table**: Uses `is_admin()` function instead of querying users

### 3. Allows Profile Creation
- New users can now insert their own profile row
- No more 403/500 errors during sign-up

## 🔄 Alternative Solution

If the alternative solution doesn't work, try `fix-users-rls-recursion.sql` which:
- Uses a function that directly queries `public.users` table
- Relies on `SECURITY DEFINER` to bypass RLS
- Slightly more complex but should work in most Supabase setups

## ✅ Verification Checklist

After running the fix:

- [ ] User can sign up without errors
- [ ] User profile is created successfully
- [ ] User can add items to cart
- [ ] Cart operations work (add, remove, update)
- [ ] Admin can access admin dashboard
- [ ] No more infinite recursion errors in console

## 🐛 If Issues Persist

1. **Check admin_emails table exists:**
   ```sql
   SELECT * FROM admin_emails;
   ```

2. **Ensure admin email is in admin_emails:**
   ```sql
   INSERT INTO admin_emails (email, is_active) 
   VALUES ('your-admin-email@gmail.com', true)
   ON CONFLICT (email) DO UPDATE SET is_active = true;
   ```

3. **Verify function exists:**
   ```sql
   SELECT public.is_admin();
   ```

4. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('users', 'artworks', 'orders', 'cart');
   ```

## 📝 Notes

- The `is_admin()` function is STABLE, meaning it will be cached for the duration of a query
- The function uses `SECURITY DEFINER` to run with elevated privileges
- Admin checks now use `admin_emails` table instead of `users.role`
- Make sure your admin email is in the `admin_emails` table

## 🚀 After Fix

Once fixed, your authentication flow should work:
1. User signs in with Google OAuth
2. AuthCallback page receives the session
3. User profile is created in `users` table (no errors)
4. User can add items to cart (no 500 errors)
5. All operations work smoothly!

