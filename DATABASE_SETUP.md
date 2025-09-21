# Database Integration Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `zoe-art-gallery`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Configure Environment Variables

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

3. Update your `.env.local` file:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (artists, artworks, exhibitions, etc.)
- Sample data for testing
- Proper indexes for performance
- Row Level Security policies
- File storage bucket for images

## Step 4: Configure File Storage

1. Go to **Storage** in your Supabase dashboard
2. You should see the `gallery-images` bucket created
3. Go to **Settings > Storage** and configure:
   - **File size limit**: 10MB (or your preference)
   - **Allowed MIME types**: `image/*`
   - **Public bucket**: ✅ (already set)

## Step 5: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/admin` and try:
   - Viewing existing data
   - Adding a new artist
   - Adding a new artwork
   - Uploading an image

## Step 6: Production Deployment

### For Vercel:
1. Go to your Vercel project settings
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### For Netlify:
1. Go to Site settings > Environment variables
2. Add the same variables

## Database Schema Overview

### Tables Created:
- **artists**: Artist profiles and information
- **artworks**: Artwork details and metadata
- **exhibitions**: Exhibition information
- **exhibition_artworks**: Many-to-many relationship between exhibitions and artworks

### Key Features:
- **UUID primary keys** for all tables
- **Automatic timestamps** (created_at, updated_at)
- **Foreign key relationships** with cascade deletes
- **Row Level Security** for data protection
- **File storage** for images
- **Search indexes** for performance

### Sample Data:
The schema includes sample data for all 6 artists and 6 artworks, plus 4 exhibitions to get you started.

## Next Steps

After setup, you can:
1. Customize the admin interface
2. Add more sophisticated search/filtering
3. Implement real-time updates
4. Add user authentication
5. Set up automated backups

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**:
   - Restart your dev server after updating `.env.local`
   - Check that variable names start with `VITE_`

2. **Database connection errors**:
   - Verify your Supabase URL and key are correct
   - Check that your project is active (not paused)

3. **File upload issues**:
   - Ensure the `gallery-images` bucket exists
   - Check file size limits and MIME types

4. **Permission errors**:
   - Verify RLS policies are set correctly
   - Check that your anon key has proper permissions

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Review the browser console for errors
3. Verify all environment variables are set correctly
