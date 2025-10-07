# Google Authentication & Admin System Setup Guide

## 🎯 **New Features Added**

### ✅ **Google Authentication**
- **Continue with Google** button on both login and signup forms
- **OAuth Integration** with Supabase Auth
- **Automatic role assignment** based on admin email list
- **Seamless user experience** with Google sign-in

### ✅ **Enhanced Admin System**
- **Separate Admin Table** (`admin_emails`) for secure access control
- **Email-based Admin Access** - Only emails in admin_emails table can be admins
- **Automatic Role Assignment** - Users are automatically assigned admin/customer role
- **Secure Admin Dashboard** - Only verified admin emails can access

## 🔧 **Setup Instructions**

### Step 1: Google OAuth Configuration

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - Copy the Client ID and Client Secret

4. **Configure in Supabase**
   - Go to your Supabase Dashboard
   - Navigate to "Authentication" > "Providers"
   - Find "Google" and click "Enable"
   - Add your Google OAuth credentials:
     - Client ID: Your Google OAuth Client ID
     - Client Secret: Your Google OAuth Client Secret
   - Save the configuration

### Step 2: Database Setup

1. **Run the Updated SQL Script**
   - Go to Supabase SQL Editor
   - Copy and paste the entire `supabase-setup.sql` content
   - Click "Run" to create all tables including `admin_emails`

2. **Add Admin Emails**
   - Go to Table Editor > `admin_emails`
   - Add your admin email addresses:
     ```sql
     INSERT INTO admin_emails (email, created_by) VALUES
     ('your-email@domain.com', 'system'),
     ('another-admin@domain.com', 'system');
     ```

### Step 3: Environment Configuration

1. **Update your `.env` file** with:
   ```env
   VITE_SUPABASE_URL=https://ibgztilnaecjexshxmrz.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_RAZORPAY_KEY_ID=your-razorpay-key
   VITE_RAZORPAY_KEY_SECRET=your-razorpay-secret
   ```

2. **No additional environment variables needed** for Google OAuth (configured in Supabase)

### Step 4: Test the System

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Google Authentication**
   - Visit `http://localhost:3001`
   - Click "Sign In" or "Sign Up"
   - Click "Continue with Google"
   - Complete Google OAuth flow

3. **Test Admin Access**
   - Sign in with an email that's in the `admin_emails` table
   - You should be automatically redirected to `/admin`
   - Verify admin dashboard access

## 🎯 **How It Works**

### **Authentication Flow**
1. **User clicks "Continue with Google"**
2. **Supabase redirects to Google OAuth**
3. **User authenticates with Google**
4. **Google redirects back to Supabase**
5. **Supabase redirects to `/auth/callback`**
6. **System checks if email is in `admin_emails` table**
7. **User role is automatically assigned** (admin/customer)
8. **User is redirected** to appropriate page

### **Admin Access Control**
1. **Only emails in `admin_emails` table** can become admins
2. **Role is automatically assigned** during signup/signin
3. **Admin users are redirected** to `/admin` dashboard
4. **Customer users stay** on the main site

### **Database Structure**
```sql
-- Admin emails table (separate for security)
admin_emails:
- id (UUID)
- email (TEXT, UNIQUE)
- is_active (BOOLEAN)
- created_by (TEXT)
- created_at (TIMESTAMP)

-- Users table (updated)
users:
- user_id (UUID)
- name (TEXT)
- email (TEXT, UNIQUE)
- role (TEXT: 'admin' or 'customer')
- created_at (TIMESTAMP)
```

## 🔐 **Security Features**

### **Admin Email Control**
- ✅ **Separate table** for admin emails
- ✅ **Only you can add/remove** admin emails
- ✅ **Automatic role assignment** based on email list
- ✅ **No manual role selection** in UI

### **Authentication Security**
- ✅ **Google OAuth** for secure authentication
- ✅ **Supabase Auth** handles session management
- ✅ **Automatic profile creation** for new users
- ✅ **Role-based access control** throughout the app

## 📱 **User Experience**

### **For Customers**
1. **Browse artworks** and add to cart
2. **Sign in with Google** (one-click)
3. **Complete purchases** with Razorpay
4. **View order history** and track orders

### **For Admins**
1. **Sign in with Google** using admin email
2. **Automatically redirected** to admin dashboard
3. **Manage orders** and track payments
4. **Upload new artworks** with quantity tracking
5. **Full admin control** over the platform

## 🚀 **Production Deployment**

### **Google OAuth Setup**
1. **Update redirect URIs** in Google Cloud Console:
   ```
   https://your-domain.com/auth/callback
   ```
2. **Update Supabase** with production redirect URL
3. **Test OAuth flow** in production

### **Admin Management**
1. **Add production admin emails** to `admin_emails` table
2. **Remove test emails** if needed
3. **Set up proper admin access** for your team

## 🎉 **Congratulations!**

Your Arty Affairs platform now has:
- ✅ **Google Authentication** with one-click sign-in
- ✅ **Secure Admin System** with email-based access control
- ✅ **Automatic Role Assignment** based on admin email list
- ✅ **Seamless User Experience** for both customers and admins
- ✅ **Production-Ready Security** with proper access controls

The platform is now a fully functional e-commerce website with professional authentication and admin management! 🎨🔐

---

**Arty Affairs** - Where Art Meets Passion, Technology, and Security! 🎨💻🔐
