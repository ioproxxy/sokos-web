#!/usr/bin/env bash
# Sokos - Run pending database migrations
set -e
echo "Running database migrations..."
npx knex migrate:latest --knexfile database/knexfile.ts
echo "Migrations complete."
