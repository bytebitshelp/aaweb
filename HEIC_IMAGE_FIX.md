# HEIC Image Support Fix

## Problem
HEIC (High Efficiency Image Container) files cannot be displayed in web browsers. When users upload HEIC images from Apple devices, they fail to load in the browser.

## Solution Implemented

### 1. Automatic Conversion on Upload
- All HEIC/HEIF files are now automatically converted to JPEG during upload
- Uses the `heic2any` library to perform client-side conversion
- Conversion happens before uploading to Supabase Storage

### 2. Graceful Error Handling
- Existing HEIC files that can't be displayed will show a placeholder image
- Console warnings help identify HEIC files that need re-uploading

### 3. File Support
The system now supports:
- ✅ JPEG/JPG
- ✅ PNG
- ✅ HEIC/HEIF (automatically converted to JPEG)
- ✅ GIF
- ✅ WebP

## For Existing HEIC Files

If you have existing artworks with HEIC images in the database:

1. **Option 1: Re-upload the images**
   - Go to the admin dashboard
   - Edit the artwork
   - Remove the old HEIC image
   - Upload the same image again (it will be auto-converted to JPEG)

2. **Option 2: Convert manually**
   - Convert HEIC files to JPEG using a converter (e.g., online converter or image editing software)
   - Re-upload the converted JPEG files

## Testing

1. Upload a new HEIC file - it should automatically convert to JPEG
2. Check the console for conversion messages
3. Verify the uploaded file is a `.jpg` file in Supabase Storage

## Technical Details

- Conversion happens in `src/lib/imageUtils.js` using the `convertHeicToJpeg()` function
- The `uploadImageToStorage()` function automatically detects and converts HEIC files
- Quality is set to 92% to balance file size and image quality

