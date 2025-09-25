# 🚀 Aether Art Space - Vercel Deployment Guide

## 🎯 **Full Vercel Deployment with Node.js + Database**

This guide will help you deploy your complete Aether Art Space website to Vercel with full Node.js support and database functionality.

## ✅ **What You'll Get**

- ✅ **Full Node.js support** (serverless functions)
- ✅ **Built-in PostgreSQL database** (Vercel Postgres)
- ✅ **Automatic deployments** from Git
- ✅ **Custom domain** (your GoDaddy domain)
- ✅ **SSL certificates** (automatic)
- ✅ **Admin panel** with full functionality
- ✅ **File uploads** and management
- ✅ **Free tier** available

## 📋 **Prerequisites**

1. **Vercel account** (free at vercel.com)
2. **GitHub account** (for automatic deployments)
3. **GoDaddy domain** (already purchased)
4. **Git** installed locally

## 🛠️ **Step-by-Step Deployment**

### **Step 1: Prepare Your Code**

1. **Create a new GitHub repository**:
   - Go to GitHub.com
   - Click "New repository"
   - Name it `aether-art-space`
   - Make it public (for free Vercel deployment)

2. **Upload your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/aether-art-space.git
   git push -u origin main
   ```

### **Step 2: Deploy to Vercel**

1. **Go to Vercel.com** and sign up/login
2. **Click "New Project"**
3. **Import from GitHub**:
   - Select your `aether-art-space` repository
   - Click "Import"

4. **Configure deployment**:
   - **Framework Preset**: Other
   - **Root Directory**: `./vercel-deployment`
   - **Build Command**: `npm run build`
   - **Output Directory**: `./vercel-deployment`

5. **Add Environment Variables**:
   ```
   JWT_SECRET=your_super_secure_jwt_secret_here
   NODE_ENV=production
   ```

6. **Click "Deploy"**

### **Step 3: Set Up Vercel Postgres Database**

1. **In your Vercel dashboard**:
   - Go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Name it `aether-art-space-db`

2. **Get connection details**:
   - Copy the `POSTGRES_URL` from the database settings
   - Add it to your environment variables

### **Step 4: Initialize Database**

1. **Go to Vercel dashboard** → **Storage** → **Your Database**
2. **Click "Connect"** → **"Query"**
3. **Run this SQL** to create tables:

```sql
-- Create tables for Aether Art Space
CREATE TABLE IF NOT EXISTS exhibitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    curator VARCHAR(255),
    status VARCHAR(50) DEFAULT 'upcoming',
    featured_image VARCHAR(500),
    gallery_images JSONB,
    assigned_artists JSONB,
    assigned_artworks JSONB,
    call_for_artists BOOLEAN DEFAULT FALSE,
    cta_link VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    profile_image VARCHAR(500),
    social_media JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
    year INTEGER,
    medium VARCHAR(255),
    size VARCHAR(255),
    description TEXT,
    images JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_content (
    id SERIAL PRIMARY KEY,
    page_name VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    content JSONB,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_info (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(50),
    instagram VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_settings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    gallery_hours TEXT,
    footer_description TEXT,
    hero_image_ids JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_name, title, description, content, is_visible) VALUES
('home', 'Aether Art Space', 'Explore the Art of Tomorrow', '{"galleryHours": "Everyday", "footerDescription": "This is a simple description"}', TRUE),
('exhibitions', 'Gallery Exhibitions', 'Discover our curated exhibitions that showcase the best in contemporary art.', '{}', TRUE),
('artists', 'Featured Artists', 'Meet the visionary artists whose works define our gallery.', '{}', TRUE),
('gallery', 'Complete Collection', 'Explore our entire collection of contemporary artworks.', '{}', TRUE),
('about', 'About Aether Art Space', 'A contemporary art gallery dedicated to showcasing emerging and established artists.', '{"content": {"blocks": [{"title": "Our Mission", "content": "To promote contemporary art and support emerging artists.", "visible": true}, {"title": "Our History", "content": "Founded in 2024, we have been showcasing exceptional contemporary art.", "visible": true}, {"title": "Our Vision", "content": "To be a leading platform for contemporary art discovery.", "visible": true}]}}', TRUE),
('contact', 'Contact us', 'We will not answer anyway', '{}', TRUE)
ON CONFLICT (page_name) DO NOTHING;

-- Insert default contact info
INSERT INTO contact_info (email, phone, instagram, address) VALUES
('fares@fares.fares', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Insert default home settings
INSERT INTO home_settings (title, description, gallery_hours, footer_description, hero_image_ids) VALUES
('Aether Art Space', 'Explore the Art of Tomorrow', 'Everyday', 'This is a simple description', '[]')
ON CONFLICT (id) DO NOTHING;
```

### **Step 5: Connect Your GoDaddy Domain**

1. **In Vercel dashboard**:
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add Domain"
   - Enter your domain: `yourdomain.com`

2. **Update DNS in GoDaddy**:
   - Go to GoDaddy DNS management
   - Add these records:
     ```
     Type: A
     Name: @
     Value: 76.76.19.61
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

3. **Wait for SSL** (automatic, takes 5-10 minutes)

## 🎯 **Access Your Website**

- **Website**: `https://yourdomain.com`
- **Admin Panel**: `https://yourdomain.com/admin`
- **Default Login**: `admin` / `admin123`

## 🔧 **Environment Variables**

Add these in Vercel dashboard → Settings → Environment Variables:

```
JWT_SECRET=your_super_secure_jwt_secret_here
NODE_ENV=production
POSTGRES_URL=your_vercel_postgres_connection_string
```

## 🚀 **Automatic Deployments**

- **Push to GitHub** → **Automatic deployment** to Vercel
- **Preview deployments** for pull requests
- **Production deployments** for main branch

## 💰 **Cost Breakdown**

- **Vercel**: Free tier (100GB bandwidth, 100 serverless functions)
- **Vercel Postgres**: Free tier (500MB storage)
- **GoDaddy Domain**: Already purchased
- **Total**: $0/month (free tier)

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Build fails**:
   - Check `vercel.json` configuration
   - Ensure all dependencies are in `package.json`

2. **Database connection fails**:
   - Verify `POSTGRES_URL` environment variable
   - Check database tables are created

3. **Domain not working**:
   - Wait 24-48 hours for DNS propagation
   - Check DNS records in GoDaddy

4. **Admin panel not accessible**:
   - Check JWT_SECRET environment variable
   - Verify database has admin user

## 📞 **Support**

- **Vercel Documentation**: vercel.com/docs
- **Vercel Support**: vercel.com/support
- **GitHub Issues**: Create issue in your repository

---

**Deployment Package Version**: 1.0.0  
**Created**: September 2024  
**For**: Aether Art Space Website
