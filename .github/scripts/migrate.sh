#!/bin/bash

# Database Schema & Migrations tool
echo "🗄️ [Sokos Space] Checking Postgres connection string and schema updates..."

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL is not set. Skipped remote PostgreSQL migrations."
  exit 0
fi

# Run Postgres baseline migrations
echo "⚙️ Executing baseline database updates..."
psql "$DATABASE_URL" -f database/schema.sql

echo "✅ Migrations completed successfully."
