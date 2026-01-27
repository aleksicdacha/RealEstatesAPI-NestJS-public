#!/bin/bash

# Server Quick Fix Script for CORS and WebSocket Issues
# Run this on the production server

set -e

echo "🔧 Real Estate API - Server Quick Fix Script"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on server
echo -e "${YELLOW}📍 Current directory:${NC} $(pwd)"
echo ""

# Navigate to project root
cd ~/RealEstatesAPI-NestJS

echo -e "${GREEN}✓${NC} Navigated to project directory"
echo ""

# Backup current .env
echo -e "${YELLOW}📦 Creating backup of .env file...${NC}"
cp apps/api/.env apps/api/.env.backup.$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}✓${NC} Backup created"
echo ""

# Update CORS_ORIGIN in .env
echo -e "${YELLOW}🔧 Updating CORS configuration...${NC}"
if grep -q "^CORS_ORIGIN=" apps/api/.env; then
    sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002|g' apps/api/.env
    echo -e "${GREEN}✓${NC} CORS_ORIGIN updated"
else
    echo "CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002" >> apps/api/.env
    echo -e "${GREEN}✓${NC} CORS_ORIGIN added"
fi
echo ""

# Display current CORS setting
echo -e "${YELLOW}📋 Current CORS configuration:${NC}"
grep "CORS_ORIGIN" apps/api/.env
echo ""

# Stash any uncommitted changes
echo -e "${YELLOW}💾 Checking for uncommitted changes...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Uncommitted changes found. Stashing...${NC}"
    git stash save "Auto-stash before quick fix $(date +%Y%m%d-%H%M%S)"
    echo -e "${GREEN}✓${NC} Changes stashed"
else
    echo -e "${GREEN}✓${NC} No uncommitted changes"
fi
echo ""

# Rebuild API
echo -e "${YELLOW}🔨 Rebuilding API...${NC}"
cd apps/api
npm run build > /dev/null 2>&1
echo -e "${GREEN}✓${NC} API built successfully"
echo ""

# Go back to root
cd ../..

# Restart PM2 services
echo -e "${YELLOW}🔄 Restarting PM2 services...${NC}"
pm2 restart all
echo -e "${GREEN}✓${NC} Services restarted"
echo ""

# Wait a moment for services to start
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 3
echo ""

# Show PM2 status
echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status
echo ""

# Show recent logs
echo -e "${YELLOW}📜 Recent logs (last 20 lines):${NC}"
pm2 logs --lines 20 --nostream
echo ""

# Test API endpoint
echo -e "${YELLOW}🧪 Testing API endpoint...${NC}"
if curl -s http://localhost:3000/v1/properties/public > /dev/null; then
    echo -e "${GREEN}✓${NC} API is responding"
else
    echo -e "${RED}✗${NC} API is not responding"
fi
echo ""

echo -e "${GREEN}✅ Quick fix completed!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://46.224.231.217:3001 in your browser"
echo "   2. Check browser console for CORS errors (F12)"
echo "   3. Navigate to Agent Chat page"
echo "   4. Verify WebSocket connection"
echo ""
echo "🔍 To monitor logs in real-time:"
echo "   pm2 logs"
echo ""
echo "🔙 To restore previous .env (if needed):"
echo "   ls apps/api/.env.backup.*"
echo "   cp apps/api/.env.backup.XXXXXX apps/api/.env"
echo ""
