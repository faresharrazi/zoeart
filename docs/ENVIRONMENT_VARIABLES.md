# Environment Variables

Copy `.env.example` to `.env.local` for local development. `.env.local` is
git-ignored and takes precedence over `.env`. In production, set the variables
in the Vercel project settings (Settings → Environment Variables).

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. `POSTGRES_URL` is used as a fallback. |
| `JWT_SECRET` | Yes in production | Signs admin login tokens. Use a long random value; the API refuses to start in production without it. Changing it signs everyone out. |
| `CLOUDINARY_CLOUD_NAME` | For image hosting | Cloudinary account. When the three Cloudinary values are missing, uploads are stored in Postgres instead (fine for local development). |
| `CLOUDINARY_API_KEY` | For image hosting | |
| `CLOUDINARY_API_SECRET` | For image hosting | |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_EMAIL` | Once | Used by `npm run db:setup` to create the first admin when the database has no users. Password must be at least 12 characters. |
| `ALLOWED_ORIGINS` | No | Extra origins allowed to call the API cross-origin, comma-separated. The site itself and aetherartspace.com are always allowed. |
| `SITE_URL` | No | Public address used in the sitemap and link previews, e.g. `https://www.aetherartspace.com`. Defaults to the host of each request. |
| `NODE_ENV` | Set by Vercel | `production` enables SSL to the database and hides error details. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit real credentials. Use different values for production and local development.
