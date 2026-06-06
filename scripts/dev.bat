@echo off
:: Sokos - Start frontend and backend in development mode concurrently
echo Starting Sokos development servers...
npx concurrently --names "FRONTEND,BACKEND" --prefix-colors "cyan,yellow" ^
  "npm run dev --workspace frontend" ^
  "npm run dev --workspace backend"
