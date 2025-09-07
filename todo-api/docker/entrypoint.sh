#!/bin/sh
set -e

echo "Running Prisma migrations..."
until npx prisma migrate deploy; do
  echo "DB not ready, retrying in 3s..."
  sleep 3
done

echo "Starting Nest app..."
node dist/main.js