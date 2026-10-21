# Zoeart - Art Gallery Website

A modern art gallery website built with React, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm i

# Configure local environment (Postgres URL, JWT secret, first admin)
cp .env.example .env.local

# Create tables and the first admin user, then copy the live site's
# public content (or use `npm run db:seed` for sample content)
npm run db:setup
npm run db:import-live

# Start the API (port 3001) and the frontend (port 8080) together
npm run dev:full
```

The frontend calls `/api`, which Vite proxies to the Express server in development.
`npm run db:setup` applies `database/schema.sql` without sample content; use it for a
fresh production database.

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries
├── server/                # Backend Express server
│   ├── routes/           # API routes
│   ├── config/           # Server configuration
│   ├── middleware/        # Express middleware
│   └── services/         # Business logic services
├── database/             # schema.sql, dev seed, historical migrations
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## Technologies

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Image Hosting**: Cloudinary
- **Deployment**: Vercel

## Documentation

- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Cloudinary Setup](docs/CLOUDINARY_SETUP.md)
- [Database Migrations](database/README.md)
- [Scripts](scripts/README.md)
