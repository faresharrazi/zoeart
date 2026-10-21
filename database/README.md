# Database

- `schema.sql` is the baseline schema. It is idempotent: run it on a new
  database, or again on an existing one.
- `migrations/YYYY-MM-DD-name.sql` are changes on top of it, applied once each
  and in order by `npm run db:migrate`, which records them in the
  `schema_migrations` table. **Run it against production (with its
  `DATABASE_URL`) before deploying code that needs a new migration.**
  `npm run db:setup` runs the schema and the migrations together.
- The undated files in `migrations/` are the history that led to
  `schema.sql`; they are already part of it and are never run again.
- `seed-dev.sql` is sample content for local development (`npm run db:seed`).
  Never run it in production: it empties the content tables first.
- `npm run db:import-live` copies the live site's public content into a local
  database instead (it refuses to run against anything but localhost).
