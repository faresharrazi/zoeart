# 🎨 Aether Art Space - Full-Stack Deployment Package

## 📦 What's Included

This package contains everything needed to deploy your complete Aether Art Space website to GoDaddy cPanel hosting.

### 🗂️ Files Overview

| File | Purpose |
|------|---------|
| `index.html` | Main website entry point |
| `assets/` | CSS, JavaScript, and static assets |
| `collaborators/` | Partner organization logos |
| `logo/` | Website logos and branding |
| `favicon.ico` | Website icon |
| `server.cjs` | Node.js backend server |
| `package.json` | Dependencies and scripts |
| `database-schema.sql` | Complete database structure |
| `setup-database.sql` | Quick database setup script |
| `config.example.js` | Configuration template |
| `start.sh` | Startup script |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment instructions |

## 🚀 Quick Start

1. **Upload** all files to your GoDaddy hosting
2. **Set up** MySQL database using `setup-database.sql`
3. **Configure** `config.js` with your database credentials
4. **Install** dependencies: `npm install`
5. **Start** the server: `node server.cjs`

## 🔗 Access Points

- **Website**: `https://yourdomain.com`
- **Admin Panel**: `https://yourdomain.com/admin`
- **API**: `https://yourdomain.com/api`

## 🔐 Default Admin Access

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these immediately after deployment!**

## 📋 Features Included

✅ **Frontend Website**
- Responsive design
- Exhibition galleries
- Artist profiles
- Artwork collections
- Contact forms
- Newsletter subscription

✅ **Admin Panel**
- Exhibition management
- Artist management
- Artwork management
- Page content editing
- Newsletter management
- User authentication

✅ **Database Integration**
- MySQL database
- Full CRUD operations
- Data persistence
- User management

✅ **File Management**
- Image uploads
- Bulk image handling
- File organization

## 🛠️ Requirements

- GoDaddy hosting with Node.js support
- MySQL database
- Domain name configured
- SSL certificate (recommended)

## 📖 Documentation

See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

---

**Package Version**: 1.0.0  
**Created**: September 2024  
**For**: Aether Art Space Website
