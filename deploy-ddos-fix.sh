#!/bin/bash

# DDoS Fix Deployment Script
# Date: January 28, 2026
# Purpose: Deploy DDoS prevention fixes to production

set -e  # Exit on error

echo "========================================="
echo "DDoS Fix Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup current state
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
git stash save "Pre-DDoS-fix backup $(date +%Y%m%d-%H%M%S)" || true
BACKUP_BRANCH="backup-before-ddos-fix-$(date +%Y%m%d)"
git branch "$BACKUP_BRANCH" 2>/dev/null || echo "Backup branch already exists"
echo -e "${GREEN}✓ Backup created: $BACKUP_BRANCH${NC}"
echo ""

# Step 2: Check for Overpass connections before deployment
echo -e "${YELLOW}Step 2: Checking for existing Overpass connections...${NC}"
OVERPASS_COUNT=$(sudo netstat -an 2>/dev/null | grep -c "92.118.207.21" || echo "0")
if [ "$OVERPASS_COUNT" -gt 0 ]; then
    echo -e "${RED}⚠️  WARNING: Found $OVERPASS_COUNT active connections to Overpass API${NC}"
    echo "These will be stopped when services restart."
else
    echo -e "${GREEN}✓ No Overpass connections detected${NC}"
fi
echo ""

# Step 3: Stop services
echo -e "${YELLOW}Step 3: Stopping PM2 services...${NC}"
pm2 stop all
echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

# Step 4: Install dependencies (if needed)
echo -e "${YELLOW}Step 4: Checking dependencies...${NC}"
cd apps/api
if [ -f "package.json" ]; then
    npm install --production
    echo -e "${GREEN}✓ API dependencies updated${NC}"
fi
cd ../..
echo ""

# Step 5: Build applications
echo -e "${YELLOW}Step 5: Building applications...${NC}"

echo "  - Building API..."
cd apps/api
npm run build
cd ../..
echo -e "${GREEN}  ✓ API built${NC}"

echo "  - Building Admin-web..."
cd apps/admin-web
npm run build
cd ../..
echo -e "${GREEN}  ✓ Admin-web built${NC}"

echo "  - Building User-web..."
cd apps/user-web
npm run build
cd ../..
echo -e "${GREEN}  ✓ User-web built${NC}"
echo ""

# Step 6: Start services
echo -e "${YELLOW}Step 6: Starting PM2 services...${NC}"

cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production || pm2 restart realestates-api
echo -e "${GREEN}  ✓ API started${NC}"

cd ../admin-web
pm2 start npm --name "realestates-admin" -- start || pm2 restart realestates-admin
echo -e "${GREEN}  ✓ Admin-web started${NC}"

cd ../user-web
pm2 start npm --name "realestates-user" -- start || pm2 restart realestates-user
echo -e "${GREEN}  ✓ User-web started${NC}"

cd ../..
echo ""

# Step 7: Save PM2 configuration
echo -e "${YELLOW}Step 7: Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✓ PM2 configuration saved${NC}"
echo ""

# Step 8: Wait for services to initialize
echo -e "${YELLOW}Step 8: Waiting for services to initialize (10 seconds)...${NC}"
sleep 10
echo -e "${GREEN}✓ Services initialized${NC}"
echo ""

# Step 9: Verify deployment
echo -e "${YELLOW}Step 9: Running post-deployment checks...${NC}"

# Check PM2 status
echo "  - Checking PM2 status..."
pm2 status
echo ""

# Check for Overpass connections
echo "  - Checking for Overpass API connections..."
OVERPASS_COUNT_AFTER=$(sudo netstat -an 2>/dev/null | grep -c "92.118.207.21" || echo "0")
if [ "$OVERPASS_COUNT_AFTER" -eq 0 ]; then
    echo -e "${GREEN}  ✓ No Overpass connections (GOOD)${NC}"
else
    echo -e "${RED}  ✗ WARNING: Found $OVERPASS_COUNT_AFTER connections to Overpass API${NC}"
fi
echo ""

# Check API health
echo "  - Testing API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/v1/properties/public?page=1&limit=1 || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ API responding (HTTP $API_RESPONSE)${NC}"
else
    echo -e "${RED}  ✗ API not responding properly (HTTP $API_RESPONSE)${NC}"
fi
echo ""

# Show recent logs
echo "  - Recent logs (last 20 lines)..."
pm2 logs --lines 20 --nostream
echo ""

# Step 10: Summary
echo "========================================="
echo -e "${GREEN}DEPLOYMENT COMPLETE${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Monitor logs: pm2 logs --lines 100"
echo "2. Watch for Overpass connections: sudo netstat -an | grep '92.118.207.21'"
echo "3. Test rate limiting: See DDOS_FIX_DEPLOYMENT_CHECKLIST.md"
echo "4. Monitor for 24 hours"
echo ""
echo "If issues occur, rollback with:"
echo "  git checkout $BACKUP_BRANCH"
echo "  npm run build"
echo "  pm2 restart all"
echo ""
echo "Documentation:"
echo "  - Full checklist: documentation/DDOS_FIX_DEPLOYMENT_CHECKLIST.md"
echo "  - Investigation summary: documentation/DDOS_INVESTIGATION_SUMMARY.md"
echo "  - Security analysis: documentation/DDOS_SECURITY_ANALYSIS.md"
echo ""

# Optional: Start monitoring
read -p "Start real-time log monitoring? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Monitoring logs (Ctrl+C to exit)..."
    pm2 logs
fi
