#!/bin/sh
set -e

echo "📦 Ensuring dependencies are up to date..."
pnpm install --dangerously-allow-all-builds

if [ -f "prisma/schema.prisma" ]; then
  echo "🔄 Generating Prisma Client..."
  npx prisma generate

  echo "🗄️ Pushing database schema..."
  npx prisma db push
fi

exec pnpm start:dev