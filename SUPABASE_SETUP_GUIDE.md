# Supabase Setup Guide for Arty Affairs

## Step 1: Create Environment File

1. Create a `.env` file in your project root directory
2. Copy the contents from `supabase-config.env` into your `.env` file:

```env
VITE_SUPABASE_URL=https://ibgztilnaecjexshxmrz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo
```

## Step 2: Set Up Database Tables

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute the script

This will create:
- ✅ `artworks` table with sample data
- ✅ `workshops` table with sample data  
- ✅ `interior_design_projects` table with sample data
- ✅ Storage bucket for images
- ✅ Row Level Security policies
- ✅ Database indexes for performance

## Step 3: Verify Setup

1. Go to the "Table Editor" in your Supabase dashboard
2. You should see three new tables: `artworks`, `workshops`, `interior_design_projects`
3. Check the "Storage" section to see the `artwork-images` bucket

## Step 4: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Navigate to different pages to test:
   - Shop page should show sample artworks
   - Workshops page should show sample workshops
   - Interior Design page should show sample projects
   - Upload Artwork page should allow you to upload new pieces

## Step 5: Add Your Content

### Replace Sample Data
- Update artwork information in the `artworks` table
- Add your own workshop schedules in the `workshops` table
- Customize interior design projects in the `interior_design_projects` table

### Upload Images
- Use the Upload Artwork page to add new artworks
- Images will be automatically stored in your Supabase storage bucket
- Update existing records with your own image URLs

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**
   - Make sure `.env` file is in the root directory
   - Restart your development server after creating `.env`

2. **Database connection errors**
   - Verify your Supabase URL and anon key are correct
   - Check that the database tables were created successfully

3. **Image upload issues**
   - Ensure the storage bucket `artwork-images` exists
   - Check that RLS policies are set up correctly

4. **Permission errors**
   - Verify that RLS policies allow public access for viewing and inserting data

### Need Help?
- Check the Supabase dashboard for any error messages
- Review the browser console for client-side errors
- Ensure all SQL scripts ran successfully

## Next Steps

Once everything is working:
1. Replace placeholder images with your actual artwork
2. Add a hero video to the `public` folder
3. Customize the content and branding
4. Deploy to production (Vercel/Netlify)

Your Arty Affairs website is now connected to Supabase and ready to use! 🎨
