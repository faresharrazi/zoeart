# Zoeart - Art Gallery Website

A modern art gallery website built with React, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm i

# Start development server
npm run dev
```

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
├── database/             # Database files
│   ├── migrations/       # SQL migration files
│   └── setup/           # Database setup files
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
