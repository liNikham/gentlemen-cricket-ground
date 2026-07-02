#!/bin/sh
set -e

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.modules.yaml" ]; then
  echo "📦 Installing dependencies..."
  pnpm install --dangerously-allow-all-builds
else
  echo "✅ Dependencies already installed."
fi

exec pnpm start:dev