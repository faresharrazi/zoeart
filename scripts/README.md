# Scripts

This folder contains utility scripts for database management and migrations.

## Files

- `setup-database.cjs` - Initial database setup script
- `migrate-about-blocks.cjs` - Migration script for about blocks
- `migrate-working-hours.cjs` - Migration script for working hours

## Usage

Run these scripts with Node.js:

```bash
node scripts/setup-database.cjs
node scripts/migrate-about-blocks.cjs
node scripts/migrate-working-hours.cjs
```

## Note

These scripts are typically run once during initial setup or when migrating data between different database structures.
