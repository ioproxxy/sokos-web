#!/bin/bash

# Start both backend and frontend servers in parallel using concurrent execution
echo "🚀 [Sokos Space] Orchestrating concurrent development systems on port 3000..."

# Boot Express monolith database and applet coordinator concurrently
npx concurrently \
  -n "backend,frontend" \
  -c "blue,magenta" \
  "tsx server.ts" \
  "vite --port 3000 --host 0.0.0.0"
