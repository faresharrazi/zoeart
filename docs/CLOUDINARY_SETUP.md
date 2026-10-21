# Cloudinary Setup

Images uploaded from the admin panel are stored in Cloudinary, under the
`zoeart/` folder (`zoeart/exhibitions`, `zoeart/artworks`, `zoeart/artists`,
`zoeart/hero`). Uploads are signed by the API server, so no upload preset is
needed and visitors can't upload directly.

## Credentials

In the Cloudinary console, open **Settings → API Keys** and copy the cloud
name, API key and API secret into:

- `.env.local` for local development (optional: without them, uploads are
  stored in Postgres), or
- the Vercel project settings for production.

See [Environment Variables](ENVIRONMENT_VARIABLES.md).

## How images are used

- The API stores the full Cloudinary URL on each record.
- The site requests resized versions by adding transformations to that URL
  (see `src/lib/images.ts`), so the original upload is kept untouched.
- When a record or image is deleted from the admin panel, the API also deletes
  the Cloudinary asset, but only for assets in this account's `zoeart/` folder.
