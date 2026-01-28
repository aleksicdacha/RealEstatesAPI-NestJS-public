#!/bin/bash
# Quick Server Start Script
# Usage: ./QUICK_SERVER_START.sh

set -e  # Exit on error

echo "🚀 Starting Real Estate Platform on Production Server"
echo "================================================"

# Change to project directory
cd ~/RealEstatesAPI-NestJS
echo "✅ Changed to project directory"

# Check Docker
echo ""
echo "🐳 Checking Docker services..."
docker ps
if ! docker ps | grep -q postgres; then
    echo "⚠️  PostgreSQL not running, starting it..."
    docker compose up -d postgres
    sleep 5
fi
echo "✅ PostgreSQL is running"

# Build everything
echo ""
echo "🔨 Building applications..."
echo "Installing dependencies..."
npm install > /dev/null 2>&1

echo "Building shared packages..."
cd packages/types && npm run build > /dev/null 2>&1 && cd ../..

echo "Building all apps..."
npm run build > /dev/null 2>&1

echo "✅ All builds complete"

# Verify builds
echo ""
echo "🔍 Verifying builds..."
if [ ! -f "apps/api/dist/main.js" ]; then
    echo "❌ API build failed - apps/api/dist/main.js not found"
    exit 1
fi
echo "✅ API build verified"

if [ ! -d "apps/admin-web/.next" ]; then
    echo "❌ Admin build failed - apps/admin-web/.next not found"
    exit 1
fi
echo "✅ Admin build verified"

if [ ! -d "apps/user-web/.next" ]; then
    echo "❌ User build failed - apps/user-web/.next not found"
    exit 1
fi
echo "✅ User build verified"

# Start PM2
echo ""
echo "🚦 Starting PM2 processes..."
pm2 delete all > /dev/null 2>&1 || true  # Delete old processes if exist
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ PM2 processes started and saved"

# Show status
echo ""
echo "📊 Current Status:"
pm2 status

echo ""
echo "🎉 All applications started successfully!"
echo ""
echo "📍 Access URLs:"
echo "   - API:   http://46.224.231.217:3000"
echo "   - Admin: http://46.224.231.217:3001"
echo "   - User:  http://46.224.231.217:3002"
echo ""
echo "📝 View logs: pm2 logs"
echo "🔄 Restart:   pm2 restart all"
echo "🛑 Stop:      pm2 stop all"
echo ""
