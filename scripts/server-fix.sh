#!/bin/bash

################################################################################
# SERVER SETUP - Copy and paste this ENTIRE script on the server
#
# Run this on server: 46.224.231.217
# User: root
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔧 Real Estate Platform - Server Fix & Deploy        ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Navigate to project
cd ~/RealEstatesAPI-NestJS

echo -e "${YELLOW}Step 1: Handling Git Conflicts...${NC}"
echo ""
echo -e "${CYAN}You have made changes directly on the server.${NC}"
echo -e "${CYAN}We need to save them before pulling new code.${NC}"
echo ""
echo -e "${YELLOW}Choose an option:${NC}"
echo -e "  ${GREEN}1)${NC} Stash server changes and pull new code (RECOMMENDED)"
echo -e "  ${GREEN}2)${NC} Reset server to match GitHub (discards server changes)"
echo -e "  ${GREEN}3)${NC} Commit server changes first, then pull"
echo ""
read -p "Enter choice [1-3]: " git_choice
echo ""

case $git_choice in
    1)
        echo -e "${CYAN}Stashing server changes...${NC}"
        git stash save "Server changes backup $(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Changes stashed${NC}"
        echo ""
        echo -e "${CYAN}Pulling latest code from GitHub...${NC}"
        git fetch origin develop
        git pull origin develop --rebase
        echo -e "${GREEN}✅ Code updated${NC}"
        ;;
    2)
        echo -e "${RED}⚠️  WARNING: This will discard all server changes!${NC}"
        read -p "Are you sure? [yes/no]: " confirm
        if [ "$confirm" == "yes" ]; then
            git fetch origin develop
            git reset --hard origin/develop
            git clean -fd
            echo -e "${GREEN}✅ Reset to GitHub version${NC}"
        else
            echo -e "${YELLOW}Cancelled. Exiting.${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${CYAN}Committing server changes...${NC}"
        git add .
        git commit -m "Server changes $(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Changes committed${NC}"
        echo ""
        echo -e "${CYAN}Pulling latest code...${NC}"
        git fetch origin develop
        git pull origin develop --rebase
        echo -e "${GREEN}✅ Code updated${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Step 2: Stopping existing PM2 processes...${NC}"
pm2 stop all || true
pm2 delete all || true
echo -e "${GREEN}✅ Processes stopped${NC}"
echo ""

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 4: Building shared packages...${NC}"
cd packages/types
npm run build
cd ../..
echo -e "${GREEN}✅ Shared packages built${NC}"
echo ""

echo -e "${YELLOW}Step 5: Building applications...${NC}"
echo -e "${CYAN}  Building API...${NC}"
cd apps/api
npm run build
cd ../..
echo -e "${CYAN}  Building Admin Web...${NC}"
cd apps/admin-web
npm run build
cd ../..
echo -e "${CYAN}  Building User Web...${NC}"
cd apps/user-web
npm run build
cd ../..
echo -e "${GREEN}✅ All applications built${NC}"
echo ""

echo -e "${YELLOW}Step 6: Checking environment configuration...${NC}"
if [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env from production template...${NC}"
    cp apps/api/.env.production apps/api/.env
    echo -e "${RED}❌ IMPORTANT: Edit apps/api/.env with your secrets!${NC}"
    echo -e "${YELLOW}   Run: nano apps/api/.env${NC}"
    echo -e "${YELLOW}   Then run this script again.${NC}"
    exit 1
fi

# Check if CORS_ORIGIN includes server IP
if ! grep -q "CORS_ORIGIN=.*46.224.231.217" apps/api/.env; then
    echo -e "${RED}⚠️  CORS_ORIGIN in .env doesn't include server IP!${NC}"
    echo -e "${YELLOW}   This will cause WebSocket errors!${NC}"
    echo ""
    read -p "Fix it now? [yes/no]: " fix_cors
    if [ "$fix_cors" == "yes" ]; then
        # Backup original
        cp apps/api/.env apps/api/.env.backup
        # Update CORS_ORIGIN
        sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002|' apps/api/.env
        echo -e "${GREEN}✅ CORS_ORIGIN updated${NC}"
    fi
fi

echo -e "${GREEN}✅ Environment verified${NC}"
echo ""

echo -e "${YELLOW}Step 7: Starting services with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ Services started${NC}"
echo ""

echo -e "${YELLOW}Step 8: Configuring PM2 startup...${NC}"
pm2 startup | tail -1 | bash || true
echo -e "${GREEN}✅ PM2 startup configured${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Server Setup Complete!                            ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status
echo ""

echo -e "${YELLOW}🌐 Application URLs:${NC}"
echo -e "  API:        ${BLUE}http://46.224.231.217:3000/v1${NC}"
echo -e "  Admin Web:  ${BLUE}http://46.224.231.217:3001${NC}"
echo -e "  User Web:   ${BLUE}http://46.224.231.217:3002${NC}"
echo ""

echo -e "${YELLOW}🔍 Test Commands:${NC}"
echo -e "  ${CYAN}curl http://localhost:3000/v1/properties/public${NC}"
echo -e "  ${CYAN}pm2 logs realestates-api --lines 30${NC}"
echo ""

echo -e "${GREEN}✅ Done! Your applications are running.${NC}"
echo ""
