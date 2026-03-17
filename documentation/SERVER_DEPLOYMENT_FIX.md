# Server Deployment Issues - Complete Fix Guide

## Issues Identified

1. **WebSocket CORS Error** - Socket.IO not allowing connections from admin-web
2. **Git Branch Conflict** - Local and server develop branches diverged
3. **Docker Command Error** - Using `docker-compose` instead of `docker compose`
4. **PM2 Empty** - No processes running, builds not found

---

## Solution 1: Fix Git Branch Conflict

### On Server (when you have uncommitted changes):

```bash
cd ~/RealEstatesAPI-NestJS

# Option A: Stash server changes and pull from local
git stash save "Server changes before sync"
git pull origin develop
git stash pop  # Review conflicts if any

# Option B: Force pull (DANGER - loses server changes)
git fetch origin
git reset --hard origin/develop

# Option C: Create backup branch and pull
git checkout -b server-backup-$(date +%Y%m%d)
git checkout develop
git pull origin develop
```

### On Local (to push latest changes):

```bash
cd ~/Projects/RealEstatesAPI-NestJS

# Make sure you're on develop branch
git checkout develop

# Commit any local changes
git add .
git commit -m "Latest changes before server sync"

# Push to origin
git push origin develop
```

---

## Solution 2: Fix WebSocket CORS Issue

The WebSocket gateway needs to match the CORS settings in main.ts. This is already fixed in the repository, but make sure the server has the latest code.

**File**: `apps/api/src/entities/agent-chat/agent-chat.gateway.ts`

The gateway already has correct CORS settings. The issue is that Socket.IO needs both:
1. Gateway-level CORS (already configured)
2. Main app CORS to allow Socket.IO handshake (already configured)

**Solution**: Make sure the API is restarted after pulling latest code.

---

## Solution 3: Complete Server Deployment Commands

### Step-by-Step Deployment on Server:

```bash
# 1. Connect to server
ssh root@46.224.231.217

# 2. Navigate to project
cd ~/RealEstatesAPI-NestJS

# 3. Pull latest code (after fixing git conflict)
git pull origin develop

# 4. Run the complete setup script
chmod +x SERVER_COMPLETE_SETUP.sh
./SERVER_COMPLETE_SETUP.sh
```

### Or Manual Step-by-Step:

```bash
# 1. Stop all PM2 processes
pm2 stop all
pm2 delete all

# 2. Pull latest code
git pull origin develop

# 3. Install dependencies
npm install

# 4. Build shared packages
cd packages/types && npm run build && cd ../..

# 5. Build all apps
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..

# 6. Start Docker services (use 'docker compose' not 'docker-compose')
docker compose up -d

# 7. Wait for database
sleep 10

# 8. Run migrations (if needed)
cd apps/api && npm run migration:run && cd ../..

# 9. Create log directories
mkdir -p apps/api/logs
mkdir -p apps/admin-web/logs
mkdir -p apps/user-web/logs

# 10. Start PM2 processes
pm2 start ecosystem.config.js

# 11. Save PM2 configuration
pm2 save

# 12. Check status
pm2 status
pm2 logs --lines 50
```

---

## Solution 4: Quick Commands Reference

### Check PM2 Status
```bash
pm2 status
pm2 list
```

### View Logs
```bash
pm2 logs                      # All logs
pm2 logs realestates-api      # API logs only
pm2 logs realestates-admin    # Admin logs only
pm2 logs realestates-user     # User logs only
pm2 logs --lines 100          # Last 100 lines
```

### Restart Services
```bash
pm2 restart all                    # Restart all
pm2 restart realestates-api        # Restart API only
pm2 restart realestates-admin      # Restart admin only
pm2 restart realestates-user       # Restart user only
```

### Stop/Start Services
```bash
pm2 stop all
pm2 start ecosystem.config.js
```

### Delete and Recreate
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## Solution 5: Verify Environment Files

Make sure these files exist and have correct values:

### apps/api/.env
```bash
cat apps/api/.env
```

Should contain:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=estates
JWT_SECRET=your_jwt_secret_min_32_chars
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002
```

### apps/admin-web/.env.production
```bash
cat apps/admin-web/.env.production
```

Should contain:
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NODE_ENV=production
PORT=3001
```

### apps/user-web/.env.production
```bash
cat apps/user-web/.env.production
```

Should contain:
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=production
PORT=3002
```

---

## Solution 6: Troubleshooting

### If builds are not found:

```bash
# Check if builds exist
ls -la apps/api/dist/main.js
ls -la apps/admin-web/.next
ls -la apps/user-web/.next

# If missing, rebuild
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..
```

### If Docker services are not running:

```bash
# Check Docker status
docker compose ps

# Start Docker services
docker compose up -d

# Check logs
docker compose logs -f postgres
```

### If WebSocket still doesn't work:

```bash
# Check if API is listening on correct port
netstat -tulpn | grep 3000

# Check API logs for errors
pm2 logs realestates-api --lines 100

# Test WebSocket connection
curl -i http://46.224.231.217:3000/socket.io/?EIO=4&transport=polling
```

---

## Complete One-Command Deployment

For future deployments, you can use this single command:

```bash
ssh root@46.224.231.217 'cd ~/RealEstatesAPI-NestJS && git pull origin develop && ./SERVER_COMPLETE_SETUP.sh'
```

Or create a local deployment script that does everything from your local machine.

---

## Automated Deployment Script (Optional)

Create `scripts/deploy-to-server.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Production Server..."

# 1. Push latest code
git push origin develop

# 2. SSH to server and deploy
ssh root@46.224.231.217 << 'ENDSSH'
cd ~/RealEstatesAPI-NestJS
git pull origin develop
./SERVER_COMPLETE_SETUP.sh
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Check status at: http://46.224.231.217:3001"
```

Usage:
```bash
chmod +x scripts/deploy-to-server.sh
./scripts/deploy-to-server.sh
```
