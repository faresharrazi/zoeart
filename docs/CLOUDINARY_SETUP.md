# Cloudinary Setup Guide

## Step 1: Get Your Cloudinary Credentials

1. Go to your Cloudinary dashboard: https://console.cloudinary.com/app/c-d33edd93f10d70fd52676bfa50aab9
2. Click on "Dashboard" in the top menu
3. Copy these values:
   - **Cloud Name**: `c-d33edd93f10d70fd52676bfa50aab9` (already provided)
   - **API Key**: Copy from dashboard
   - **API Secret**: Copy from dashboard

## Step 2: Set Up Environment Variables

### For Local Development

Create a `.env` file in your project root with:

```bash
# Database Configuration
DATABASE_URL=your_database_url_here
POSTGRES_URL=your_postgres_url_here

# Authentication
JWT_SECRET=your_jwt_secret_here

# Image Hosting (Cloudinary)
CLOUDINARY_CLOUD_NAME=c-d33edd93f10d70fd52676bfa50aab9
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here

# Environment
NODE_ENV=development
```

### For Vercel Production

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `CLOUDINARY_CLOUD_NAME` | `c-d33edd93f10d70fd52676bfa50aab9` | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | `your_api_key_here` | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | `your_api_secret_here` | Production, Preview, Development |
| `CLOUDINARY_UPLOAD_PRESET` | `your_upload_preset_here` | Production, Preview, Development |

## Step 3: Test Your Setup

Once you've set up the environment variables, you can test the Cloudinary integration by:

1. Starting your development server
2. Going to the admin panel
3. Trying to upload an image
4. Checking the server logs for Cloudinary upload messages

## Step 4: Optional - Set Up Upload Presets

For unsigned uploads (recommended for security), you can create upload presets:

1. Go to Cloudinary dashboard → Settings → Upload
2. Click "Add upload preset"
3. Configure the preset:
   - **Preset name**: `zoeart_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `zoeart`
   - **Use filename**: `Yes`
4. Save the preset and use the name in `CLOUDINARY_UPLOAD_PRESET`

## Troubleshooting

### Common Issues:

1. **"Cloudinary config error"**: Check that all three credentials are set correctly
2. **"Upload failed"**: Verify your API key and secret are correct
3. **"Access denied"**: Make sure your Cloudinary account is active

### Testing Commands:

```bash
# Test if environment variables are loaded
node -e "console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME)"

# Test Cloudinary connection
node -e "const cloudinary = require('cloudinary').v2; cloudinary.config({cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET}); console.log('Cloudinary configured:', !!cloudinary.config().cloud_name)"
```
