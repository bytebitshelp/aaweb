# Production Google OAuth Redirect Fix Guide

## 🚨 Issue
After deployment, Google OAuth redirects to `localhost` instead of your production domain.

## ✅ Solution

The code has been updated to support environment variables for the redirect URL. You need to configure the following:

### Step 1: Set Environment Variable in Your Deployment Platform

#### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new environment variable:
   - **Name**: `VITE_SITE_URL`
   - **Value**: `https://your-production-domain.com` (replace with your actual domain)
   - **Environment**: Production (and Preview if needed)
4. Save and **redeploy** your application

#### For Netlify:
1. Go to your Netlify site dashboard
2. Navigate to **Site configuration** > **Environment variables**
3. Add a new environment variable:
   - **Key**: `VITE_SITE_URL`
   - **Value**: `https://your-production-domain.com`
4. Save and **redeploy** your site

#### For Other Platforms:
Add the environment variable `VITE_SITE_URL` with your production domain URL.

---

### Step 2: Update Supabase Redirect URLs

1. **Go to Supabase Dashboard**
   - Visit [Supabase Dashboard](https://app.supabase.com)
   - Select your project

2. **Configure Site URL**
   - Go to **Authentication** > **URL Configuration**
   - Set **Site URL** to: `https://your-production-domain.com`
   - Add **Redirect URLs**:
     ```
     https://your-production-domain.com/auth/callback
     http://localhost:5173/auth/callback (for local development)
     ```

3. **Verify Google Provider Settings**
   - Go to **Authentication** > **Providers** > **Google**
   - Ensure Google provider is enabled
   - Verify your Google OAuth credentials are correct

---

### Step 3: Update Google Cloud Console Redirect URIs

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project

2. **Update OAuth 2.0 Credentials**
   - Go to **APIs & Services** > **Credentials**
   - Click on your OAuth 2.0 Client ID
   - In **Authorized redirect URIs**, add:
     ```
     https://ibgztilnaecjexshxmrz.supabase.co/auth/v1/callback
     ```
   - **Important**: Keep the Supabase callback URL - this is where Google redirects to first, then Supabase redirects to your app
   - Save the changes

---

### Step 4: Verify the Configuration

1. **Check the code** - The `signInWithGoogle` function now uses:
   ```javascript
   const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
   const redirectUrl = `${siteUrl}/auth/callback`
   ```

2. **Test the flow**:
   - Deploy your updated code
   - Visit your production site
   - Click "Sign In with Google"
   - Verify it redirects to your production domain, not localhost

---

### Step 5: Common Issues and Troubleshooting

#### Issue: Still redirecting to localhost
**Solution**: 
- Clear your browser cache and cookies
- Ensure the environment variable is set in your deployment platform
- Verify the deployment includes the updated code
- Check browser console for the redirect URL being used (it will log: "Google OAuth redirect URL: ...")

#### Issue: "redirect_uri_mismatch" error
**Solution**:
- Ensure the redirect URI in Google Cloud Console matches exactly: `https://ibgztilnaecjexshxmrz.supabase.co/auth/v1/callback`
- The redirect URI should be the Supabase callback URL, NOT your app's callback URL

#### Issue: OAuth works but redirects to wrong domain
**Solution**:
- Verify `VITE_SITE_URL` environment variable is set correctly
- Check that Supabase redirect URLs include your production domain
- Ensure there are no typos in the domain name

---

### Quick Checklist

Before deploying, ensure:
- ✅ `VITE_SITE_URL` environment variable is set to your production domain
- ✅ Supabase Site URL is set to your production domain
- ✅ Supabase Redirect URLs include `https://your-domain.com/auth/callback`
- ✅ Google Cloud Console has `https://ibgztilnaecjexshxmrz.supabase.co/auth/v1/callback` in authorized redirect URIs
- ✅ Code has been updated (already done - the fix is in `src/contexts/AuthContext.jsx`)
- ✅ Application has been redeployed with the new environment variable

---

### Development vs Production

**Development (Local):**
- Uses `window.location.origin` (typically `http://localhost:5173`)
- No environment variable needed for local development

**Production:**
- Uses `VITE_SITE_URL` environment variable if set
- Falls back to `window.location.origin` if environment variable is not set
- Always set `VITE_SITE_URL` in production to ensure correct redirects

---

### Need Help?

If you continue to experience issues:
1. Check the browser console for error messages
2. Check the redirect URL logged: "Google OAuth redirect URL: ..."
3. Verify all configuration steps above
4. Ensure you've redeployed after setting the environment variable

---

**Note**: After making these changes, you must redeploy your application for the environment variable changes to take effect.

