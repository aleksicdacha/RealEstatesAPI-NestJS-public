#!/bin/bash
# Quick Server Commands - Copy & Paste Reference
# Save this file or keep it open for quick access

cat << 'EOF'

╔══════════════════════════════════════════════════════════════╗
║          REAL ESTATE PLATFORM - SERVER COMMANDS              ║
╠══════════════════════════════════════════════════════════════╣
║  Server IP: 46.224.231.217                                   ║
║  Project Path: ~/RealEstatesAPI-NestJS                       ║
╚══════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════
 1. CONNECT TO SERVER
═══════════════════════════════════════════════════════════════

ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS

═══════════════════════════════════════════════════════════════
 2. DEPLOYMENT SCENARIOS
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ A) NORMAL DEPLOYMENT (no issues)                            │
└─────────────────────────────────────────────────────────────┘
git pull origin develop
./SERVER_COMPLETE_SETUP.sh

┌─────────────────────────────────────────────────────────────┐
│ B) GIT CONFLICT EXISTS                                       │
└─────────────────────────────────────────────────────────────┘
./SERVER_GIT_FIX.sh          # Choose option 1 or 2
./SERVER_COMPLETE_SETUP.sh

┌─────────────────────────────────────────────────────────────┐
│ C) PM2 IS EMPTY / BUILD ERRORS                              │
└─────────────────────────────────────────────────────────────┘
./SERVER_MANUAL_DEPLOY.sh    # Rebuilds everything

┌─────────────────────────────────────────────────────────────┐
│ D) DEPLOY FROM LOCAL MACHINE (automated)                    │
└─────────────────────────────────────────────────────────────┘
# Run on your local machine:
cd ~/Projects/RealEstatesAPI-NestJS
./scripts/deploy-to-production.sh

═══════════════════════════════════════════════════════════════
 3. PM2 COMMANDS (Process Management)
═══════════════════════════════════════════════════════════════

# Check status
pm2 status
pm2 list

# View logs
pm2 logs                           # All apps
pm2 logs realestates-api           # API only
pm2 logs realestates-admin         # Admin only
pm2 logs realestates-user          # User only
pm2 logs --lines 100               # Last 100 lines

# Restart
pm2 restart all                    # Restart all
pm2 restart realestates-api        # Restart API only
pm2 restart realestates-admin      # Restart admin only

# Stop/Start
pm2 stop all
pm2 start ecosystem.config.js
pm2 save

# Monitor in real-time
pm2 monit

# Delete all and start fresh
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

═══════════════════════════════════════════════════════════════
 4. DOCKER COMMANDS
═══════════════════════════════════════════════════════════════

# Check status
docker compose ps
docker ps

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f postgres
docker compose logs -f redis

# Restart PostgreSQL
docker compose restart postgres

═══════════════════════════════════════════════════════════════
 5. GIT COMMANDS
═══════════════════════════════════════════════════════════════

# Check status
git status
git log --oneline -10

# Pull latest code
git pull origin develop

# Fix conflicts (use helper script)
./SERVER_GIT_FIX.sh

# Manual conflict resolution
git stash save "backup-$(date +%Y%m%d)"
git pull origin develop

# Force reset (DANGER - loses changes)
git fetch origin
git reset --hard origin/develop

═══════════════════════════════════════════════════════════════
 6. BUILD COMMANDS (Manual)
═══════════════════════════════════════════════════════════════

# Install dependencies
npm install

# Build shared packages
cd packages/types && npm run build && cd ../..

# Build API
cd apps/api && npm run build && cd ../..

# Build Admin Web
cd apps/admin-web && npm run build && cd ../..

# Build User Web
cd apps/user-web && npm run build && cd ../..

# Verify builds
ls -la apps/api/dist/main.js
ls -la apps/admin-web/.next
ls -la apps/user-web/.next

═══════════════════════════════════════════════════════════════
 7. TROUBLESHOOTING COMMANDS
═══════════════════════════════════════════════════════════════

# Check if ports are in use
netstat -tulpn | grep 3000
netstat -tulpn | grep 3001
netstat -tulpn | grep 3002

# Check API health
curl http://46.224.231.217:3000/v1/properties
curl http://localhost:3000/v1/properties

# Check WebSocket
curl -i http://46.224.231.217:3000/socket.io/?EIO=4&transport=polling

# Check disk space
df -h

# Check memory usage
free -h

# Check system logs
journalctl -u pm2-root -n 100

═══════════════════════════════════════════════════════════════
 8. ENVIRONMENT FILES
═══════════════════════════════════════════════════════════════

# View environment files
cat apps/api/.env
cat apps/admin-web/.env.production
cat apps/user-web/.env.production

# Edit environment files
nano apps/api/.env
nano apps/admin-web/.env.production
nano apps/user-web/.env.production

═══════════════════════════════════════════════════════════════
 9. DATABASE COMMANDS
═══════════════════════════════════════════════════════════════

# Run migrations
cd apps/api
npm run migration:run
cd ../..

# Revert last migration
cd apps/api
npm run migration:revert
cd ../..

# Create admin user
cd apps/api
npm run seed:users
cd ../..

# Access PostgreSQL directly
docker exec -it realestatesapi-nestjs-postgres-1 psql -U postgres -d estates

═══════════════════════════════════════════════════════════════
 10. QUICK FIXES
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ FIX: WebSocket CORS errors                                  │
└─────────────────────────────────────────────────────────────┘
pm2 restart realestates-api
pm2 logs realestates-api --lines 50

┌─────────────────────────────────────────────────────────────┐
│ FIX: Changes not showing on website                         │
└─────────────────────────────────────────────────────────────┘
pm2 restart realestates-admin
# In browser: Ctrl+Shift+R (hard refresh)

┌─────────────────────────────────────────────────────────────┐
│ FIX: Port already in use                                    │
└─────────────────────────────────────────────────────────────┘
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js

┌─────────────────────────────────────────────────────────────┐
│ FIX: Database connection errors                             │
└─────────────────────────────────────────────────────────────┘
docker compose restart postgres
sleep 10
pm2 restart realestates-api

═══════════════════════════════════════════════════════════════
 11. ACCESS URLS
═══════════════════════════════════════════════════════════════

API:        http://46.224.231.217:3000
API Docs:   http://46.224.231.217:3000/api/docs
Admin:      http://46.224.231.217:3001
User Web:   http://46.224.231.217:3002

═══════════════════════════════════════════════════════════════
 12. ONE-LINER DEPLOYMENT
═══════════════════════════════════════════════════════════════

# Full deployment in one command
ssh root@46.224.231.217 'cd ~/RealEstatesAPI-NestJS && ./SERVER_MANUAL_DEPLOY.sh'

# With git pull
ssh root@46.224.231.217 'cd ~/RealEstatesAPI-NestJS && git pull origin develop && ./SERVER_COMPLETE_SETUP.sh'

═══════════════════════════════════════════════════════════════

EOF
