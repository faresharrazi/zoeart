# Database

- `schema.sql` is the current schema. It is idempotent: run it on a new
  database, or again on an existing one, with `npm run db:setup`.
- `seed-dev.sql` is sample content for local development (`npm run db:seed`).
  Never run it in production: it empties the content tables first.
- `migrations/` holds the historical steps that produced the current schema,
  plus any new changes (named `YYYY-MM-DD-description.sql`). Apply new
  migrations to production by hand, in order, after taking a backup.
