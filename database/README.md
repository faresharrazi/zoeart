# Database Files

This folder contains all database-related files organized by purpose.

## Structure

- `migrations/` - SQL migration files for database schema changes
- `setup/` - Initial database setup files (currently empty)

## Migration Files

The migration files are organized chronologically and should be applied in order:

1. `database-schema-postgres.sql` - Main database schema
2. `add-current-status-to-exhibitions.sql` - Add 'current' status to exhibitions
3. `create-hero-images-table.sql` - Create hero images table for Cloudinary
4. `add-missing-columns.sql` - Add missing columns to various tables
5. Other migration files as needed

## Usage

These files are typically run against your PostgreSQL database to update the schema. Always backup your database before running migrations.
