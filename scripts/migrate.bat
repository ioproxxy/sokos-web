@echo off
:: Sokos - Run pending database migrations
echo Running database migrations...
cd /d "%~dp0.."
npx knex migrate:latest --knexfile database/knexfile.ts
if %ERRORLEVEL% neq 0 (
  echo Migration failed.
  exit /b 1
)
echo Migrations complete.
