# 🚀 Complete Arty Affairs Setup Guide

## ✅ **Step 1: Create .env File (CRITICAL)**

**You MUST create a `.env` file manually:**

1. **Right-click** in your project folder
2. **New** → **Text Document**
3. **Name it exactly**: `.env` (remove the `.txt` extension)
4. **Copy and paste this content**:

```env
VITE_SUPABASE_URL=https://ibgztilnaecjexshxmrz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo

# Razorpay Configuration (Add your Razorpay keys here)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Admin User Credentials
# Email: asadmohammed181105@gmail.com
# Password: 123456789
# Role: admin (automatically assigned based on email)
```

5. **Save the file**

## ✅ **Step 2: Setup Supabase Database**

1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Open your project**: `ibgztilnaecjexshxmrz`
3. **Go to**: SQL Editor
4. **Run the complete schema**:

```sql
-- Copy and paste the entire content from supabase-schema.sql
-- OR run the database-setup-verification.sql to check current status
```

5. **Verify tables exist**:
   - `users`
   - `artworks` 
   - `orders`
   - `cart`
   - `admin_emails`
   - `workshops`
   - `interior_design_projects`

## ✅ **Step 3: Test Authentication**

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: `http://localhost:5173`

3. **Click the user icon** in the top right

4. **Try to sign in** with:
   - **Email**: `asadmohammed181105@gmail.com`
   - **Password**: `123456789`

5. **Expected behavior**:
   - ✅ **Success**: Redirected to Admin Dashboard
   - ❌ **Failure**: Check browser console for errors

## ✅ **Step 4: Create Admin User (if needed)**

If the admin user doesn't exist in Supabase Auth:

1. **Go to**: Supabase Dashboard → Authentication → Users
2. **Click**: "Add user"
3. **Fill in**:
   - **Email**: `asadmohammed181105@gmail.com`
   - **Password**: `123456789`
   - **Confirm password**: `123456789`
4. **Click**: "Create user"

## ✅ **Step 5: Verify Admin Email in Database**

Run this SQL in Supabase SQL Editor:

```sql
-- Check if admin email exists
SELECT * FROM admin_emails WHERE email = 'asadmohammed181105@gmail.com';

-- If no results, insert admin email
INSERT INTO admin_emails (email, is_active) 
VALUES ('asadmohammed181105@gmail.com', true) 
ON CONFLICT (email) DO NOTHING;
```

## ✅ **Step 6: Test Complete Flow**

1. **Sign in** with admin credentials
2. **Verify redirect** to admin dashboard
3. **Check navigation** - should show admin-only items
4. **Test upload artwork** functionality
5. **Sign out** and test customer signup
6. **Verify customer redirect** to home page

## 🔧 **Troubleshooting**

### Issue: "Invalid login credentials"
**Solutions**:
- Verify admin user exists in Supabase Auth
- Check email/password are correct
- Ensure email is confirmed

### Issue: "User not found in users table"
**Solutions**:
- Check database connection
- Verify RLS policies
- Check if user profile creation is working

### Issue: "Admin access denied"
**Solutions**:
- Verify email is in `admin_emails` table
- Check `is_active` is `true`
- Restart dev server after creating `.env`

### Issue: "Environment variables not loaded"
**Solutions**:
- Ensure `.env` file exists (not `.env.txt`)
- Restart dev server
- Check file is in project root

## 📋 **Final Checklist**

- [ ] `.env` file created with correct Supabase credentials
- [ ] Database tables created (run `supabase-schema.sql`)
- [ ] Admin email added to `admin_emails` table
- [ ] Admin user created in Supabase Auth
- [ ] Dev server restarted after `.env` creation
- [ ] Authentication working (can sign in)
- [ ] Admin redirect working (goes to admin dashboard)
- [ ] Customer signup working
- [ ] All navigation items visible based on role

## 🚀 **Ready to Go!**

Once all steps are completed:
1. **Authentication will work properly**
2. **Admin users will see admin dashboard**
3. **Customers will see normal pages**
4. **All features will be functional**

## 📞 **Need Help?**

If you're still having issues:
1. Check browser console for errors
2. Verify `.env` file exists and has correct content
3. Check Supabase dashboard for database errors
4. Ensure all SQL scripts have been run successfully

---

**🎉 Your Arty Affairs application should now be fully functional!**
