# Upload Buffering/Hanging Fix Guide

## Quick Diagnostic Steps

### Step 1: Check Browser Console
When upload starts buffering, check the browser console for:
- Authentication status messages
- "Upload in progress..." messages (should appear every 5 seconds)
- Any error messages after timeout

### Step 2: Check Browser Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try uploading again
4. Look for a request to:
   - `storage/v1/object/artwork-images/artworks/...`
   - Check if it shows:
     - **Pending** (hanging - policy issue)
     - **401/403** (permission denied)
     - **404** (bucket not found)
     - **400** (bad request - might be MIME type issue)

### Step 3: Verify Storage Setup
Run `test-storage-upload.sql` in Supabase SQL Editor to check:
- Bucket exists and is public
- Policies are correct (should show `{public, anon, authenticated}` for INSERT)

### Step 4: Verify Policies Were Applied
Run this in Supabase SQL Editor:
```sql
SELECT policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%artwork%'
ORDER BY cmd, policyname;
```

**Expected result:**
- INSERT policy should show `roles: {public, anon, authenticated}`
- If it shows only `{authenticated}`, the policies weren't updated correctly

### Step 5: Re-run Policy Fix
If policies are wrong:
1. Run `fix-storage-bucket-policies.sql` again
2. Verify the policies using the query above
3. Try uploading again

### Step 6: Check MIME Type Restrictions
Run `fix-bucket-mime-types.sql` to remove MIME type restrictions

### Step 7: Check Authentication
The upload should work even if you're not logged in (if policies are correct).
But check the console for:
```
Upload authentication status: { isAuthenticated: true/false, ... }
```

## Common Issues & Fixes

### Issue 1: Policies Not Updated
**Symptom:** INSERT policy shows only `{authenticated}`
**Fix:** Run `fix-storage-bucket-policies.sql` again

### Issue 2: MIME Type Restrictions
**Symptom:** Upload fails for videos or certain image types
**Fix:** Run `fix-bucket-mime-types.sql`

### Issue 3: Network Request Pending Forever
**Symptom:** Network tab shows request as "Pending" for 30+ seconds
**Possible causes:**
- RLS policies blocking the request
- Network connectivity issue
- Supabase service issue

**Fix:**
1. Check if other Supabase requests work (like fetching artworks)
2. Try in incognito mode (to rule out browser cache)
3. Check Supabase status page

### Issue 4: CORS Error
**Symptom:** Console shows CORS error
**Fix:** This is usually a Supabase configuration issue. Check Supabase project settings.

## Quick Test

Try uploading a small image (like 100KB) to see if it's a file size issue.

## If Nothing Works

1. **Check Supabase Dashboard → Storage → artwork-images**
   - Does the bucket exist?
   - Is it marked as "Public"?
   - What are the file size limits?

2. **Check Supabase Dashboard → Storage → Policies**
   - Are there policies for the `artwork-images` bucket?
   - Do they allow INSERT for anonymous users?

3. **Try a direct test upload** in Supabase Dashboard:
   - Go to Storage → artwork-images
   - Click "Upload file"
   - Try uploading a test image
   - If this works, the issue is with the code/API
   - If this fails, the issue is with bucket/policies

## Emergency Workaround

If Storage upload continues to fail, we can temporarily use base64 for small files (< 1MB), but this is NOT recommended for production.

