# Database

PostgreSQL schema and migration scripts for Sokos Marketplace.

## Structure

```
schema.sql       # Baseline schema (source of truth)
migrations/      # Incremental SQL migration files (ordered by timestamp)
```

## Running Migrations

```bash
npm run migrate          # from repo root (workspace command)
# or directly:
npx knex migrate:latest --knexfile knexfile.ts
```

## Adding a New Migration

```bash
npx knex migrate:make <migration_name> --knexfile knexfile.ts
```
