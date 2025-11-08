# Quick Storage Setup Guide

## Problem
Base64 images are too large for database storage. We need to use Supabase Storage.

## Solution - 2 Steps:

### Step 1: Create Storage Bucket (2 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New bucket** button
5. Fill in:
   - **Name**: `artwork-images`
   - **Public bucket**: ✅ Check this box (IMPORTANT!)
6. Click **Create bucket**

### Step 2: Run Storage Policies SQL (1 minute)

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the contents of `fix-storage-bucket-policies.sql`
3. Click **Run** (or press F5)
4. You should see "Success" message

## That's it! 

Now you can upload images and videos. The files will be stored in Storage and only URLs will be saved in the database.

## Verify Setup

After setup, try uploading an artwork. If it works, you'll see the images display correctly.

## Troubleshooting

If upload still fails:
1. Check that bucket name is exactly `artwork-images`
2. Check that bucket is marked as **Public**
3. Verify the SQL script ran successfully
4. Check browser console for specific error messages

