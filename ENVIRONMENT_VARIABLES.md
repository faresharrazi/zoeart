# Environment Variables

This document describes the required environment variables for the zoeart application.

## Required Variables

### Database Configuration
- `DATABASE_URL` - Primary database connection string
- `POSTGRES_URL` - Alternative database connection string (fallback)

### Authentication
- `JWT_SECRET` - Secret key for JWT token signing

### Image Hosting (Cloudinary)
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `CLOUDINARY_UPLOAD_PRESET` - Upload preset for unsigned uploads (optional)

### Environment
- `NODE_ENV` - Environment mode (development, production)

## Vercel Configuration

When setting up the database in Vercel:

1. **Custom Prefix**: Use `DATABASE_` prefix
2. **Environment Variables**: Vercel will automatically create:
   - `DATABASE_URL`
   - `DATABASE_HOST`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME`

## Security Notes

- Never commit actual database credentials to the repository
- Use Vercel's environment variable system for production
- Keep JWT secrets secure and rotate them regularly
- Use different credentials for development, preview, and production environments
