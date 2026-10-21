# Scripts

`setup-database.cjs` prepares a database:

```bash
npm run db:setup   # apply database/schema.sql, create the first admin if none exists
npm run db:seed    # same, plus sample content (local development only)
```

It reads `DATABASE_URL` and the `ADMIN_*` variables from `.env.local` / `.env`
(see [docs/ENVIRONMENT_VARIABLES.md](../docs/ENVIRONMENT_VARIABLES.md)).
