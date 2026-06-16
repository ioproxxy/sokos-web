#!/bin/bash

# Production bundler orchestrator
echo "📦 [Sokos Space] Commencing multi-stage compilation builds..."

# Build client bundle
vite build

# Compile Node.js backend to independent standalone distribution
npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs

echo "✅ [Sokos Space] Distribution successfully compiled and written in dist/."
