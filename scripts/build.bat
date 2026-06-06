@echo off
:: Sokos - Production build (frontend + backend)
echo Building Sokos for production...

echo [1/2] Building frontend...
npm run build --workspace frontend
if %ERRORLEVEL% neq 0 (
  echo Frontend build failed.
  exit /b 1
)

echo [2/2] Building backend...
npm run build --workspace backend
if %ERRORLEVEL% neq 0 (
  echo Backend build failed.
  exit /b 1
)

echo Build complete. Artifacts in frontend/dist and backend/dist.
