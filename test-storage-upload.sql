-- Test Storage Upload Setup
-- Run this to verify your Storage bucket and policies are set up correctly

-- 1. Check if bucket exists and is public
SELECT 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'artwork-images';

-- 2. Check Storage policies for artwork-images bucket
SELECT 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND (
    policyname LIKE '%artwork%' OR
    qual LIKE '%artwork-images%' OR
    with_check LIKE '%artwork-images%'
  )
ORDER BY cmd, policyname;

-- 3. Expected results:
--    - Bucket should exist with public = true
--    - Should have at least 4 policies:
--      * SELECT policy for public/anonymous users
--      * INSERT policy for public/anonymous/authenticated users
--      * UPDATE policy (optional)
--      * DELETE policy (optional)

-- 4. If policies are missing or wrong, run:
--    fix-storage-bucket-policies.sql

-- 5. If MIME types are restricted, run:
--    fix-bucket-mime-types.sql

