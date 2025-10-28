# Database Reinitialization Guide

## ⚠️ IMPORTANT: This will reset your database

## Steps to Reinitialize

### 1. Run the SQL Script
1. Go to: https://supabase.com/dashboard/project/ibgztilnaecjexshxmrz/sql
2. Open the file: `REINITIALIZE_DATABASE.sql`
3. Copy the entire SQL script
4. Paste into Supabase SQL Editor
5. **Click "Run"**

### 2. What This Does
- Creates all tables from scratch (if they don't exist)
- Sets up proper indexes for performance
- Enables RLS (Row Level Security)
- Creates permissive policies for authenticated users
- Inserts your admin user
- Verifies the setup worked

### 3. After Running
- Upload should work instantly
- No more timeouts
- Proper security in place

## Alternative: If You Want to Keep Existing Data

Instead of running the full reinitialize script, just run this to fix policies:

```sql
-- Just fix the policies without deleting data
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON artworks;
CREATE POLICY "Public read access" ON artworks
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert" ON artworks;
CREATE POLICY "Authenticated users can insert" ON artworks
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update" ON artworks;
CREATE POLICY "Authenticated users can update" ON artworks
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete" ON artworks;
CREATE POLICY "Authenticated users can delete" ON artworks
  FOR DELETE TO authenticated USING (true);
```

## Check Upload After Running

1. Go to `/upload-artwork`
2. Fill form and upload images
3. Click "Upload Artwork"
4. Should complete in < 5 seconds
5. Success! ✅

## If Still Not Working

Check:
1. Browser console for errors
2. Network tab for failed requests
3. Supabase logs for queries

The reinitialize script should fix everything!

