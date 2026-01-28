#!/bin/bash

echo "🚀 Starting Real Estate Platform..."
echo ""

# Start database
echo "📊 Starting PostgreSQL..."
docker compose up -d postgres
sleep 2

# Start API locally (until we move it to apps/api)
echo "🔧 Starting NestJS API (localhost)..."
cd /home/dalibor/Projects/RealEstatesAPI-NestJS

# Check if we have old package.json backup
if [ -f "package.json.backup" ]; then
  echo "Using backup package.json for API..."
  cp package.json.backup package.json.temp
fi

# Start in background
echo "Starting API server..."
# We'll start it manually

echo ""
echo "✅ Database started!"
echo ""
echo "📋 Next steps:"
echo "  1. Start API manually (needs fix)"
echo "  2. Admin Panel: http://localhost:3001"
echo "  3. User Frontend: http://localhost:3002/sr"
echo ""
