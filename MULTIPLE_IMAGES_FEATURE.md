# Multiple Images Feature Implementation

## Overview
This feature enables admins to upload multiple images for each artwork, which are displayed in a carousel with navigation arrows and dot indicators.

## Changes Made

### 1. Database Schema Update
**File**: `update-artworks-schema-multiple-images.sql`

- Added `image_urls` column as `TEXT[]` array to store multiple image URLs
- Migrated existing `image_url` data to `image_urls` array for backwards compatibility
- Created GIN index for faster queries on image arrays
- Maintains backwards compatibility with single `image_url` field

**Run this SQL script in your Supabase SQL Editor to update the database schema.**

### 2. Image Carousel Component
**File**: `src/components/ImageCarousel.jsx`

**Features:**
- Displays multiple images in a carousel
- Navigation arrows (< >) that appear on hover
- Dot indicators at the bottom showing current image
- Image counter (1/5 format)
- Supports both array of images and single image
- Smooth transitions between images
- Responsive design

**Usage:**
```jsx
import ImageCarousel from './ImageCarousel'

<ImageCarousel 
  images={artwork.image_urls} 
  alt="Product image" 
/>
```

### 3. Upload Form Update
**File**: `src/pages/admin/upload.jsx`

**Changes:**
- Changed from single image (`selectedImage`) to multiple images (`selectedImages` array)
- Updated `handleImageSelect` to accept multiple files (up to 5 images)
- Added grid preview of all selected images
- Each image can be individually removed
- "Add more" button to add additional images
- Uploads all images and stores in `image_urls` array

**New Features:**
- Multiple file selection support
- Image preview grid (2 columns on mobile, 3 on desktop)
- Individual image removal
- Maximum 5 images per artwork

### 4. Product Card Update
**File**: `src/components/ArtworkCard.jsx`

**Changes:**
- Integrated `ImageCarousel` component
- Falls back to single image if `image_urls` is not available
- Maintains backwards compatibility with existing single image products

**Behavior:**
- If `image_urls` exists and has images: Show carousel
- Otherwise: Show single image from `image_url` field

## How to Use

### For Admins (Uploading Artworks):

1. Go to the upload artwork page
2. Fill in artwork details
3. Click "Upload Images"
4. Select multiple images (up to 5) at once, or add them one by one
5. Preview all selected images in a grid
6. Remove unwanted images by clicking the X button
7. Submit the form

### For Users (Viewing Artworks):

1. Navigate to any artwork card
2. If the artwork has multiple images:
   - Hover over the image to reveal navigation arrows
   - Click left/right arrows to navigate
   - See dot indicators at the bottom
   - See image counter (e.g., "3/5") in the top-right
3. Click on the image to view the full product details

## Database Changes Required

Run the following SQL in your Supabase SQL Editor:

```bash
# The SQL script is located at:
update-artworks-schema-multiple-images.sql
```

**Or manually run:**
```sql
-- Add image_urls column
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Migrate existing data
UPDATE artworks 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Create index
CREATE INDEX IF NOT EXISTS idx_artworks_image_urls ON artworks USING GIN (image_urls);
```

## Backwards Compatibility

- Existing artworks with only `image_url` will continue to work
- New uploads will have both `image_url` (first image) and `image_urls` (all images)
- The carousel component gracefully handles both cases

## Features

✅ Upload multiple images (up to 5 per artwork)
✅ Image carousel with navigation arrows
✅ Dot indicators for current image
✅ Image counter display
✅ Responsive design
✅ Backwards compatible with single images
✅ Hover effects on carousel controls
✅ Smooth transitions
✅ Individual image removal
✅ Grid preview during upload

## Testing

1. **Upload with multiple images:**
   - Go to `/admin/upload` or `/upload-artwork`
   - Select 2-5 images
   - Verify preview grid appears
   - Submit and check database

2. **View carousel:**
   - Navigate to `/shop`
   - Find artwork with multiple images
   - Hover to see arrows
   - Click arrows to navigate
   - Verify dot indicators update

3. **Backwards compatibility:**
   - View old artworks with single images
   - Verify they still display correctly
   - No carousel should appear for single images

## Files Modified

- ✅ `update-artworks-schema-multiple-images.sql` - Database schema update
- ✅ `src/components/ImageCarousel.jsx` - New carousel component
- ✅ `src/pages/admin/upload.jsx` - Updated upload form
- ✅ `src/components/ArtworkCard.jsx` - Integrated carousel
- ✅ Created `MULTIPLE_IMAGES_FEATURE.md` - This documentation

## Next Steps

1. Run the SQL script in Supabase SQL Editor
2. Test the upload functionality
3. Verify carousel displays correctly
4. Test on different devices (mobile, tablet, desktop)

## Notes

- Maximum 5 images per artwork (can be adjusted)
- Images are uploaded to Supabase Storage
- Fallback to base64 encoding if storage upload fails
- Carousel only appears when multiple images exist
- Single image products work without carousel

