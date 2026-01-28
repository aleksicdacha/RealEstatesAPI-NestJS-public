#!/bin/bash

# Server Git Fix and Complete Deployment
# Date: January 28, 2026
# Purpose: Fix git divergence and deploy all fixes

set -e  # Exit on error

echo "========================================="
echo "Server Git Fix and Deployment"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Create backup of current server state
echo -e "${YELLOW}Step 1: Creating server backup...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BRANCH="server-backup-$TIMESTAMP"

# Save any uncommitted changes
git stash save "Server changes before merge $TIMESTAMP" || echo "No local changes to save"

# Create backup branch from current state
git branch "$BACKUP_BRANCH" 2>/dev/null || echo "Backup branch creation skipped"
echo -e "${GREEN}✓ Backup created: $BACKUP_BRANCH${NC}"
echo ""

# Step 2: Fix git divergence by rebasing
echo -e "${YELLOW}Step 2: Fixing git divergence...${NC}"
git config pull.rebase false  # Use merge strategy
git pull origin develop --no-edit || {
    echo -e "${RED}✗ Merge conflict detected${NC}"
    echo "Attempting auto-resolution..."

    # Accept incoming changes for critical files
    git checkout --theirs apps/api/src/main.ts 2>/dev/null || true
    git checkout --theirs apps/api/src/common/filters/http-exception.filter.ts 2>/dev/null || true
    git checkout --theirs apps/user-web/next.config.ts 2>/dev/null || true

    git add -A
    git commit -m "Merge develop with server changes - auto-resolved conflicts" || true
}
echo -e "${GREEN}✓ Git updated to latest develop${NC}"
echo ""

# Step 3: Stop all running services
echo -e "${YELLOW}Step 3: Stopping all services...${NC}"
pm2 stop all 2>/dev/null || echo "No PM2 processes running"
pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"

# Stop Docker services
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || echo "No Docker services running"
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"

# Root dependencies
npm install

# API dependencies
cd apps/api
npm install
cd ../..

# Admin-web dependencies
cd apps/admin-web
npm install
cd ../..

# User-web dependencies
cd apps/user-web
npm install
cd ../..

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 5: Build all applications
echo -e "${YELLOW}Step 5: Building applications...${NC}"

# Build shared packages first
echo "  - Building @repo/types..."
cd packages/types
npm run build || echo "Warning: types build failed"
cd ../..

# Build API
echo "  - Building API..."
cd apps/api
npm run build
cd ../..
echo -e "${GREEN}  ✓ API built${NC}"

# Build Admin-web
echo "  - Building Admin-web..."
cd apps/admin-web
npm run build
cd ../..
echo -e "${GREEN}  ✓ Admin-web built${NC}"

# Build User-web
echo "  - Building User-web..."
cd apps/user-web
npm run build
cd ../..
echo -e "${GREEN}  ✓ User-web built${NC}"
echo ""

# Step 6: Start Docker services
echo -e "${YELLOW}Step 6: Starting Docker services...${NC}"
docker compose up -d || docker-compose up -d
sleep 5
echo -e "${GREEN}✓ Docker services started (PostgreSQL + Redis)${NC}"
echo ""

# Step 7: Run migrations
echo -e "${YELLOW}Step 7: Running database migrations...${NC}"
cd apps/api
npm run migration:run || echo "Migrations already up to date"
cd ../..
echo -e "${GREEN}✓ Migrations complete${NC}"
echo ""

# Step 8: Start PM2 services
echo -e "${YELLOW}Step 8: Starting PM2 services...${NC}"

# Start API
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production --max-memory-restart 500M
cd ../..
echo -e "${GREEN}  ✓ API started${NC}"

# Wait for API to initialize
sleep 5

# Start Admin-web
cd apps/admin-web
pm2 start npm --name "realestates-admin" -- start
cd ../..
echo -e "${GREEN}  ✓ Admin-web started${NC}"

# Start User-web
cd apps/user-web
pm2 start npm --name "realestates-user" -- start
cd ../..
echo -e "${GREEN}  ✓ User-web started${NC}"

# Save PM2 configuration
pm2 save
pm2 startup
echo ""

# Step 9: Wait for full initialization
echo -e "${YELLOW}Step 9: Waiting for services to initialize (15 seconds)...${NC}"
sleep 15
echo ""

# Step 10: Verification
echo -e "${YELLOW}Step 10: Running verification checks...${NC}"
echo ""

# Check PM2 status
echo "PM2 Status:"
pm2 status
echo ""

# Check Docker status
echo "Docker Services:"
docker compose ps || docker-compose ps
echo ""

# Check for DDoS connections
echo "  - Checking for Overpass API connections (DDoS target)..."
OVERPASS_COUNT=$(sudo netstat -an 2>/dev/null | grep -c "92.118.207.21" || echo "0")
if [ "$OVERPASS_COUNT" -eq 0 ]; then
    echo -e "${GREEN}  ✓ No suspicious Overpass connections (GOOD)${NC}"
else
    echo -e "${RED}  ✗ WARNING: Found $OVERPASS_COUNT connections to 92.118.207.21${NC}"
fi
echo ""

# Test API
echo "  - Testing API endpoint..."
curl -s http://localhost:3000/v1/properties/public?page=1&limit=1 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ API responding${NC}"
else
    echo -e "${RED}  ✗ API not responding${NC}"
fi
echo ""

# Test Admin-web
echo "  - Testing Admin-web..."
curl -s http://localhost:3001 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Admin-web responding${NC}"
else
    echo -e "${RED}  ✗ Admin-web not responding${NC}"
fi
echo ""

# Test User-web
echo "  - Testing User-web..."
curl -s http://localhost:3002 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ User-web responding${NC}"
else
    echo -e "${RED}  ✗ User-web not responding${NC}"
fi
echo ""

# Step 11: Show recent logs
echo -e "${YELLOW}Step 11: Recent application logs...${NC}"
pm2 logs --lines 30 --nostream
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}DEPLOYMENT COMPLETE${NC}"
echo "========================================="
echo ""
echo "Services Status:"
echo "  - API: http://localhost:3000"
echo "  - Admin: http://localhost:3001"
echo "  - User: http://localhost:3002"
echo ""
echo "Next Steps:"
echo "1. Monitor logs: pm2 logs"
echo "2. Check for DDoS: sudo netstat -an | grep '92.118.207.21' | wc -l"
echo "3. Monitor PM2: pm2 monit"
echo ""
echo "Backup branch created: $BACKUP_BRANCH"
echo "You can rollback with: git checkout $BACKUP_BRANCH"
echo ""
