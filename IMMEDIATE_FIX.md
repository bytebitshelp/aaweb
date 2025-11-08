# IMMEDIATE FIX - Upload Hanging Issue

## 🔴 Current Problem
Upload hangs at "Calling uploadMultipleImagesToStorage..." - this means the Storage upload request is being blocked or timing out.

## ✅ IMMEDIATE ACTION REQUIRED

### Step 1: Check Browser Network Tab (CRITICAL)
1. Open DevTools (F12)
2. Go to **Network** tab
3. **Clear the network log** (trash icon)
4. Try uploading again
5. Look for a request that contains:
   - `storage/v1/object/artwork-images/artworks/...`
   - Or `storage/v1/object/public/artwork-images/...`

**Check the status:**
- **Pending** (red, spinning) = Request is hanging (RLS policy blocking)
- **401 Unauthorized** = Authentication issue
- **403 Forbidden** = RLS policy blocking (MOST LIKELY)
- **404 Not Found** = Bucket doesn't exist
- **400 Bad Request** = MIME type or file size issue

### Step 2: Verify Storage Policies
Run this in Supabase SQL Editor:
```sql
SELECT policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%artwork%'
ORDER BY cmd, policyname;
```

**What you should see:**
- INSERT policy with `roles: {public, anon, authenticated}`
- SELECT policy with `roles: {public}`

**If you see:**
- INSERT policy with only `roles: {authenticated}` = **THIS IS THE PROBLEM**

### Step 3: Fix the Policies
Run `fix-storage-bucket-policies.sql` in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `fix-storage-bucket-policies.sql`
3. Paste and click **Run** (or press F5)
4. Verify it says "Success" or shows the policy list
5. Run the verification query again (Step 2) to confirm roles are correct

### Step 4: Remove MIME Type Restrictions
Run `fix-bucket-mime-types.sql` in Supabase SQL Editor to allow all file types.

### Step 5: Try Upload Again
After fixing policies, try uploading again. You should see:
- `[imageUtils] Upload in progress... 5s elapsed`
- `[imageUtils] Upload in progress... 10s elapsed`
- Then either success or a clear error message

## 🎯 Most Likely Cause

**RLS policies are blocking anonymous uploads.** The INSERT policy probably only allows `authenticated` users, but your upload might be happening as `anon` (anonymous).

## 🔍 What to Report Back

After checking the Network tab, please share:
1. **Status code** of the Storage request (401, 403, 404, or "Pending")
2. **Response body** (click on the request → Response tab)
3. **Result of the policies query** (what roles are shown)

This will help confirm the exact issue!

