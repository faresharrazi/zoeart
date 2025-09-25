# Aether Art Space - GoDaddy cPanel Deployment Guide

## 🚀 Full-Stack Deployment Package

This package contains everything needed to deploy your Aether Art Space website to GoDaddy cPanel hosting.

## 📁 Package Contents

- `index.html` - Main website file
- `assets/` - CSS, JS, and other static assets
- `collaborators/` - Partner logos
- `logo/` - Website logos
- `favicon.ico` - Website icon
- `server.cjs` - Node.js backend server
- `package.json` - Dependencies and scripts
- `database-schema.sql` - MySQL database structure
- `config.example.js` - Configuration template

## 🛠️ Prerequisites

1. **GoDaddy Hosting Plan** with:

   - Node.js support
   - MySQL database
   - File Manager access

2. **Domain Name** configured in GoDaddy

## 📋 Step-by-Step Deployment

### Step 1: Access cPanel

1. Log into your GoDaddy account
2. Go to your hosting dashboard
3. Click "cPanel"

### Step 2: Set Up MySQL Database

1. In cPanel, find **"MySQL Databases"**
2. Create a new database (e.g., `aether_art_space`)
3. Create a database user with full privileges
4. Note down:
   - Database name
   - Username
   - Password
   - Host (usually `localhost`)

### Step 3: Import Database Schema

1. Go to **"phpMyAdmin"** in cPanel
2. Select your database
3. Click **"Import"** tab
4. Upload `database-schema.sql`
5. Click **"Go"** to execute

### Step 4: Upload Files

1. Open **"File Manager"** in cPanel
2. Navigate to your domain's root folder (usually `public_html/`)
3. Upload all files from this package
4. Set file permissions:
   - Files: `644`
   - Folders: `755`

### Step 5: Configure Environment

1. Copy `config.example.js` to `config.js`
2. Update the configuration with your database details:
   ```javascript
   module.exports = {
     database: {
       host: "localhost",
       user: "your_actual_username",
       password: "your_actual_password",
       database: "your_actual_database_name",
     },
     // ... other settings
   };
   ```

### Step 6: Install Dependencies

1. In cPanel, find **"Terminal"** or **"Node.js"**
2. Navigate to your domain folder
3. Run: `npm install`

### Step 7: Start the Server

1. In the Node.js section of cPanel
2. Set the application root to your domain folder
3. Set the startup file to `server.cjs`
4. Start the application

### Step 8: Configure Domain

1. In cPanel, go to **"Subdomains"**
2. Create a subdomain for the API (e.g., `api.yourdomain.com`)
3. Point it to your Node.js application

## 🔧 Configuration Options

### Database Configuration

Update `config.js` with your MySQL credentials:

```javascript
database: {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database_name'
}
```

### Admin Panel Access

Default admin credentials:

- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change these immediately after deployment!**

### API Endpoints

- Frontend: `https://yourdomain.com`
- Admin Panel: `https://yourdomain.com/admin`
- API: `https://yourdomain.com/api`

## 🎯 Post-Deployment Checklist

- [ ] Database imported successfully
- [ ] Files uploaded to correct location
- [ ] Dependencies installed (`npm install`)
- [ ] Server started and running
- [ ] Website accessible at your domain
- [ ] Admin panel accessible at `/admin`
- [ ] Database connection working
- [ ] Admin credentials changed
- [ ] SSL certificate enabled (recommended)

## 🆘 Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**

   - Run `npm install` in your domain folder
   - Check Node.js version (requires 16+)

2. **Database connection errors**

   - Verify database credentials in `config.js`
   - Check if MySQL service is running
   - Ensure database user has proper permissions

3. **File permission errors**

   - Set files to `644` and folders to `755`
   - Check if Node.js has write permissions

4. **Port conflicts**
   - GoDaddy usually handles port assignment automatically
   - Check your hosting plan's Node.js configuration

## 📞 Support

If you encounter issues:

1. Check GoDaddy's Node.js documentation
2. Verify your hosting plan supports Node.js
3. Contact GoDaddy support for hosting-specific issues

## 🔒 Security Notes

- Change default admin credentials immediately
- Use strong JWT secret
- Enable SSL/HTTPS
- Regularly update dependencies
- Monitor server logs for errors

---

**Deployment Package Version**: 1.0.0  
**Created**: $(date)  
**For**: Aether Art Space Website
