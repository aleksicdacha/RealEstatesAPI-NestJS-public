#!/bin/bash
# Server Environment Setup and PM2 Start
# This script sets up environment files and starts all services

set -e

echo "🔧 Real Estate Platform - Server Setup & Start"
echo "=============================================="
echo ""

# Change to project directory
cd ~/RealEstatesAPI-NestJS || { echo "❌ Project directory not found"; exit 1; }
echo "✅ In project directory: $(pwd)"
echo ""

# ==========================================
# 1. SETUP ENVIRONMENT FILES
# ==========================================

echo "📝 Step 1: Checking environment files..."

# API Environment
if [ ! -f "apps/api/.env" ]; then
    echo "⚠️  Creating apps/api/.env from .env.example"
    cp apps/api/.env.example apps/api/.env
    echo "❗ IMPORTANT: Edit apps/api/.env with your database credentials!"
    echo "   Run: nano apps/api/.env"
    exit 1
else
    echo "✅ apps/api/.env exists"
fi

# Admin Web - Use production env on server
if [ ! -f "apps/admin-web/.env.production" ]; then
    echo "⚠️  Creating apps/admin-web/.env.production"
    cat > apps/admin-web/.env.production << 'EOF'
# Admin Web - Production Environment
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=production
PORT=3001
EOF
    echo "✅ Created apps/admin-web/.env.production"
else
    echo "✅ apps/admin-web/.env.production exists"
fi

# User Web - Use production env on server
if [ ! -f "apps/user-web/.env.production" ]; then
    echo "⚠️  Creating apps/user-web/.env.production"
    cat > apps/user-web/.env.production << 'EOF'
# User Web - Production Environment
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=production
PORT=3002
EOF
    echo "✅ Created apps/user-web/.env.production"
else
    echo "✅ apps/user-web/.env.production exists"
fi

echo ""

# ==========================================
# 2. CHECK DOCKER SERVICES
# ==========================================

echo "🐳 Step 2: Checking Docker services..."
if ! docker ps | grep -q postgres; then
    echo "⚠️  PostgreSQL not running, starting..."
    # Use 'docker compose' (new syntax) instead of 'docker-compose' (old syntax)
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose up -d postgres
    elif command -v docker-compose &> /dev/null; then
        docker-compose up -d postgres
    else
        echo "❌ Neither 'docker compose' nor 'docker-compose' command found"
        echo "   Please install Docker Compose"
        exit 1
    fi
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
else
    echo "✅ PostgreSQL is running"
fi
echo ""

# ==========================================
# 3. INSTALL DEPENDENCIES
# ==========================================

echo "📦 Step 3: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# ==========================================
# 4. BUILD SHARED PACKAGES
# ==========================================

echo "🔨 Step 4: Building shared packages..."
cd packages/types
npm run build
cd ../..
echo "✅ Shared packages built"
echo ""

# ==========================================
# 5. BUILD APPLICATIONS
# ==========================================

echo "🏗️  Step 5: Building all applications..."
echo "   - Building API..."
cd apps/api && npm run build && cd ../..
echo "   - Building Admin Web..."
cd apps/admin-web && npm run build && cd ../..
echo "   - Building User Web..."
cd apps/user-web && npm run build && cd ../..
echo "✅ All applications built"
echo ""

# ==========================================
# 6. VERIFY BUILDS
# ==========================================

echo "🔍 Step 6: Verifying builds..."
BUILD_ERRORS=0

if [ ! -f "apps/api/dist/main.js" ]; then
    echo "❌ API build failed - apps/api/dist/main.js not found"
    BUILD_ERRORS=1
else
    echo "✅ API build verified"
fi

if [ ! -d "apps/admin-web/.next" ]; then
    echo "❌ Admin build failed - apps/admin-web/.next not found"
    BUILD_ERRORS=1
else
    echo "✅ Admin Web build verified"
fi

if [ ! -d "apps/user-web/.next" ]; then
    echo "❌ User build failed - apps/user-web/.next not found"
    BUILD_ERRORS=1
else
    echo "✅ User Web build verified"
fi

if [ $BUILD_ERRORS -eq 1 ]; then
    echo ""
    echo "❌ Build verification failed. Please check errors above."
    exit 1
fi
echo ""

# ==========================================
# 7. CREATE LOG DIRECTORIES
# ==========================================

echo "📁 Step 7: Creating log directories..."
mkdir -p apps/api/logs
mkdir -p apps/admin-web/logs
mkdir -p apps/user-web/logs
echo "✅ Log directories created"
echo ""

# ==========================================
# 8. STOP OLD PM2 PROCESSES
# ==========================================

echo "🛑 Step 8: Stopping old PM2 processes..."
pm2 stop all || true
pm2 delete all || true
echo "✅ Old processes cleared"
echo ""

# ==========================================
# 9. START PM2 PROCESSES
# ==========================================

echo "🚀 Step 9: Starting PM2 processes..."
pm2 start ecosystem.config.js
echo "✅ PM2 processes started"
echo ""

# ==========================================
# 10. SAVE PM2 CONFIGURATION
# ==========================================

echo "💾 Step 10: Saving PM2 configuration..."
pm2 save
echo "✅ PM2 configuration saved"
echo ""

# ==========================================
# 11. DISPLAY STATUS
# ==========================================

echo "📊 Current Status:"
echo "===================="
pm2 status
echo ""

echo "📝 View logs:"
echo "   pm2 logs"
echo "   pm2 logs realestates-api"
echo "   pm2 logs realestates-admin"
echo "   pm2 logs realestates-user"
echo ""

echo "🌐 Access URLs:"
echo "   - API:   http://46.224.231.217:3000"
echo "   - Admin: http://46.224.231.217:3001"
echo "   - User:  http://46.224.231.217:3002"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "   1. Verify environment files have correct values:"
echo "      - nano apps/api/.env"
echo "      - nano apps/admin-web/.env.production"
echo "      - nano apps/user-web/.env.production"
echo ""
echo "   2. If you need to run migrations:"
echo "      cd apps/api && npm run migration:run && cd ../.."
echo ""
echo "   3. If you need to create admin user:"
echo "      cd apps/api && npm run seed:users && cd ../.."
echo ""
echo "   4. Setup PM2 startup (first time only):"
echo "      pm2 startup"
echo "      # Then run the command it shows you"
echo ""
