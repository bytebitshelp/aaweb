# Complete Storage Upload Fix

## Problem
Uploads are timing out due to:
1. INSERT policy only allows `authenticated` users (needs `public, anon, authenticated`)
2. Bucket MIME type restrictions block videos and some image formats
3. Possible file size limits

## Solution - Run These 3 SQL Scripts in Order:

### Step 1: Fix Storage Policies
**File: `fix-storage-bucket-policies.sql`**

This script:
- Drops the old "Authenticated users can upload" policy
- Creates new policies that allow `public, anon, authenticated` to upload
- Allows anyone to view, update, and delete artwork images

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix-storage-bucket-policies.sql`
3. Click **Run** (or press F5)
4. Verify policies show `public, anon, authenticated` in the `roles` column

### Step 2: Remove MIME Type Restrictions
**File: `fix-bucket-mime-types.sql`**

This script:
- Removes MIME type restrictions (allows videos and all image formats)
- Removes or increases file size limits
- Allows uploading any file type

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix-bucket-mime-types.sql`
3. Click **Run** (or press F5)
4. Verify the bucket now shows `allowed_mime_types: NULL` in the query result

### Step 3: Fix Database Column (if needed)
**File: `fix-image-urls-column.sql`**

This script:
- Fixes the `image_urls` column to handle multiple URLs
- Prevents "index row requires X bytes" errors

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix-image-urls-column.sql`
3. Click **Run** (or press F5)

## Alternative: Manual Bucket Settings Update

If SQL doesn't work, manually update the bucket in Supabase Dashboard:

1. Go to **Storage** → **Buckets**
2. Click on `artwork-images` bucket
3. Click the **Settings** tab (or gear icon)
4. **File size limit**: Set to `104857600` (100 MB) or leave empty
5. **Allowed MIME types**: Remove all restrictions (leave empty)
6. Click **Save**

## Verification

After running all scripts:

1. **Check Policies:**
   ```sql
   SELECT policyname, roles, cmd
   FROM pg_policies 
   WHERE tablename = 'objects' 
     AND schemaname = 'storage'
     AND policyname LIKE '%artwork%';
   ```
   
   Should show:
   - INSERT policy with roles: `{public, anon, authenticated}`
   - SELECT policy with roles: `{public}`
   - UPDATE policy with roles: `{public, anon, authenticated}`
   - DELETE policy with roles: `{public, anon, authenticated}`

2. **Check Bucket Settings:**
   ```sql
   SELECT name, public, file_size_limit, allowed_mime_types 
   FROM storage.buckets 
   WHERE name = 'artwork-images';
   ```
   
   Should show:
   - `public: true`
   - `file_size_limit: NULL` (or a large number)
   - `allowed_mime_types: NULL`

## After Fix

Try uploading again. The upload should work for:
- ✅ Any number of images/videos
- ✅ All image formats (HEIC, PNG, JPG, GIF, WebP, etc.)
- ✅ All video formats (MP4, MOV, WebM, AVI, etc.)
- ✅ Files up to 100MB (or unlimited if set to NULL)

## Troubleshooting

If upload still fails:

1. **Check browser console** for specific error messages
2. **Check Network tab** in DevTools to see the actual HTTP response
3. **Verify you're logged in** (if required by your app)
4. **Check Supabase logs** in Dashboard → Logs → Storage

