#!/usr/bin/env bash
# Sokos - Production build (frontend + backend)
set -e
echo "Building Sokos for production..."

echo "[1/2] Building frontend..."
npm run build --workspace frontend

echo "[2/2] Building backend..."
npm run build --workspace backend

echo "Build complete. Artifacts in frontend/dist and backend/dist."
