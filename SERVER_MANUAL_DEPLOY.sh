#!/bin/bash
# Server Manual Deployment - Run this ON THE SERVER
# Use this when you don't want to deal with git conflicts

set -e

echo "🚀 Real Estate Platform - Manual Server Deployment"
echo "==================================================="
echo ""

cd ~/RealEstatesAPI-NestJS || { echo "❌ Project directory not found"; exit 1; }

# ==========================================
# 1. STOP ALL PM2 PROCESSES
# ==========================================

echo "🛑 Step 1: Stopping all PM2 processes..."
pm2 stop all || true
pm2 delete all || true
echo "✅ PM2 processes stopped"
echo ""

# ==========================================
# 2. CHECK DOCKER SERVICES
# ==========================================

echo "🐳 Step 2: Checking Docker services..."
if ! docker ps | grep -q postgres; then
    echo "⚠️  PostgreSQL not running, starting..."
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose up -d
    elif command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        echo "❌ Docker Compose not found"
        exit 1
    fi
    echo "⏳ Waiting for services to start..."
    sleep 15
else
    echo "✅ Docker services running"
fi
echo ""

# ==========================================
# 3. CLEAN OLD BUILDS
# ==========================================

echo "🧹 Step 3: Cleaning old builds..."
rm -rf apps/api/dist
rm -rf apps/admin-web/.next
rm -rf apps/user-web/.next
rm -rf packages/types/dist
echo "✅ Old builds cleaned"
echo ""

# ==========================================
# 4. INSTALL DEPENDENCIES
# ==========================================

echo "📦 Step 4: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# ==========================================
# 5. BUILD SHARED PACKAGES
# ==========================================

echo "🔨 Step 5: Building shared packages..."
cd packages/types
npm run build
cd ../..
echo "✅ Shared packages built"
echo ""

# ==========================================
# 6. BUILD API
# ==========================================

echo "🏗️  Step 6: Building API..."
cd apps/api
npm run build
cd ../..

if [ ! -f "apps/api/dist/main.js" ]; then
    echo "❌ API build failed - dist/main.js not found"
    exit 1
fi
echo "✅ API built successfully"
echo ""

# ==========================================
# 7. BUILD ADMIN WEB
# ==========================================

echo "🏗️  Step 7: Building Admin Web..."
cd apps/admin-web
npm run build
cd ../..

if [ ! -d "apps/admin-web/.next" ]; then
    echo "❌ Admin Web build failed - .next directory not found"
    exit 1
fi
echo "✅ Admin Web built successfully"
echo ""

# ==========================================
# 8. BUILD USER WEB
# ==========================================

echo "🏗️  Step 8: Building User Web..."
cd apps/user-web
npm run build
cd ../..

if [ ! -d "apps/user-web/.next" ]; then
    echo "❌ User Web build failed - .next directory not found"
    exit 1
fi
echo "✅ User Web built successfully"
echo ""

# ==========================================
# 9. CREATE LOG DIRECTORIES
# ==========================================

echo "📁 Step 9: Creating log directories..."
mkdir -p apps/api/logs
mkdir -p apps/admin-web/logs
mkdir -p apps/user-web/logs
echo "✅ Log directories created"
echo ""

# ==========================================
# 10. START PM2 PROCESSES
# ==========================================

echo "🚀 Step 10: Starting PM2 processes..."
pm2 start ecosystem.config.js
pm2 save
echo "✅ PM2 processes started and saved"
echo ""

# ==========================================
# 11. DISPLAY STATUS
# ==========================================

echo "📊 Current Status:"
echo "===================="
pm2 status
echo ""
pm2 logs --lines 20
echo ""

echo "🌐 Access URLs:"
echo "   - API:   http://46.224.231.217:3000"
echo "   - Admin: http://46.224.231.217:3001"
echo "   - User:  http://46.224.231.217:3002"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📝 Useful commands:"
echo "   pm2 status           # Check status"
echo "   pm2 logs             # View all logs"
echo "   pm2 restart all      # Restart all apps"
echo "   pm2 monit            # Monitor in real-time"
