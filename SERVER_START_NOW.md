# 🚀 SERVER STARTUP - COMPLETE GUIDE

## TLDR - Commands to Run on Server Right Now

```bash
# SSH to server
ssh root@46.224.231.217

# Navigate to project
cd ~/RealEstatesAPI-NestJS

# Make setup script executable and run it
chmod +x SERVER_COMPLETE_SETUP.sh
./SERVER_COMPLETE_SETUP.sh
```

That's it! The script will do everything automatically. ✅

---

## What the Script Does

1. ✅ Creates/verifies environment files (`.env.production` for admin/user web)
2. ✅ Starts PostgreSQL in Docker
3. ✅ Installs npm dependencies
4. ✅ Builds shared packages (`@repo/types`)
5. ✅ Builds all 3 apps (API, Admin Web, User Web)
6. ✅ Verifies builds succeeded
7. ✅ Creates log directories
8. ✅ Stops old PM2 processes
9. ✅ Starts new PM2 processes from `ecosystem.config.js`
10. ✅ Saves PM2 configuration

---

## After Script Finishes

### 1. Check Status
```bash
pm2 status
# Should show 3 processes running:
# - realestates-api
# - realestates-admin  
# - realestates-user
```

### 2. View Logs
```bash
pm2 logs --lines 50
```

### 3. Test Endpoints
```bash
# Test API
curl http://46.224.231.217:3000/v1/properties/public

# Test Admin (should return HTML)
curl http://46.224.231.217:3001

# Test User (should return HTML)
curl http://46.224.231.217:3002
```

### 4. Access in Browser
- **API Docs**: http://46.224.231.217:3000/api/docs (dev only)
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

---

## If Script Fails - Manual Commands

### Option 1: Just Start PM2 (if already built)
```bash
cd ~/RealEstatesAPI-NestJS
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### Option 2: Build Then Start
```bash
cd ~/RealEstatesAPI-NestJS

# Build
npm install
cd packages/types && npm run build && cd ../..
npm run build

# Start PM2
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
```

### Option 3: Build Each App Individually
```bash
cd ~/RealEstatesAPI-NestJS

# Build API
cd apps/api
npm install
npm run build
cd ../..

# Build Admin
cd apps/admin-web
npm install
npm run build
cd ../..

# Build User
cd apps/user-web
npm install
npm run build
cd ../..

# Start PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## Fixing the CORS/WebSocket Error

The error you saw:
```
Access to XMLHttpRequest at 'http://46.224.231.217:3000/socket.io/...' 
from origin 'http://46.224.231.217:3001' has been blocked by CORS policy
```

This happens when the API is not running or has wrong CORS config.

### Fix:
```bash
# 1. Make sure API is running
pm2 status
pm2 logs realestates-api --lines 30

# 2. Check API .env file
cat ~/RealEstatesAPI-NestJS/apps/api/.env | grep CORS_ORIGIN

# 3. If CORS_ORIGIN is wrong or missing, edit it:
nano ~/RealEstatesAPI-NestJS/apps/api/.env

# Add this line (or update it):
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002

# 4. Restart API
pm2 restart realestates-api

# 5. Check logs again
pm2 logs realestates-api --lines 20
```

**Note**: The API code already has `origin: '*'` in `main.ts`, so it should work without CORS_ORIGIN env var.

---

## Common PM2 Commands

```bash
# Status
pm2 status

# Logs (all apps)
pm2 logs

# Logs (specific app)
pm2 logs realestates-api
pm2 logs realestates-admin
pm2 logs realestates-user

# Restart all
pm2 restart all

# Restart specific
pm2 restart realestates-api

# Stop all
pm2 stop all

# Start all
pm2 start all

# Delete all
pm2 delete all

# Monitor
pm2 monit

# Save current state
pm2 save

# Show detailed info
pm2 info realestates-api
```

---

## Git Sync Issues

You mentioned: "I have problem with git on develop branch on server/local. Because of changes directly on server."

### Quick Fix - Force Server to Match Local
```bash
# On server
cd ~/RealEstatesAPI-NestJS
pm2 stop all
git fetch origin
git reset --hard origin/develop  # or origin/main
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### Detailed Guide
See `GIT_SYNC_GUIDE.md` for complete instructions.

---

## First Time Setup (One-Time Commands)

If this is the first time starting on this server:

```bash
# 1. Run migrations
cd ~/RealEstatesAPI-NestJS/apps/api
npm run migration:run
cd ../..

# 2. Create admin user
cd apps/api
npm run seed:users
cd ../..

# 3. Setup PM2 to start on server reboot
pm2 startup
# Run the command it shows (starts with 'sudo env PATH=...')

# 4. Start everything
./SERVER_COMPLETE_SETUP.sh
```

---

## Environment Files Checklist

### Required Files on Server:

1. **`apps/api/.env`** - API configuration
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=estates_user
   DB_PASSWORD=your_password
   DB_NAME=estates_prod
   JWT_SECRET=your_jwt_secret_min_32_chars
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002
   ```

2. **`apps/admin-web/.env.production`** - Admin panel config
   ```env
   NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
   NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
   NODE_ENV=production
   PORT=3001
   ```

3. **`apps/user-web/.env.production`** - User website config
   ```env
   NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
   NODE_ENV=production
   PORT=3002
   ```

---

## Troubleshooting

### "Script not found: dist/main.js"
```bash
cd ~/RealEstatesAPI-NestJS/apps/api
npm run build
ls -la dist/main.js  # Verify it exists
```

### "Port 3000 already in use"
```bash
# Find what's using the port
netstat -tulpn | grep 3000

# Kill it
kill -9 <PID>

# Or restart PM2
pm2 restart realestates-api
```

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running
docker-compose up -d postgres

# Check database credentials
cat apps/api/.env | grep DB_
```

### "Module not found" errors
```bash
# Rebuild node_modules
cd ~/RealEstatesAPI-NestJS
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
npm install
npm run build
```

---

## Quick Health Check

```bash
# One-liner to check everything
cd ~/RealEstatesAPI-NestJS && \
  echo "=== PM2 Status ===" && pm2 status && \
  echo "" && echo "=== Docker Containers ===" && docker ps && \
  echo "" && echo "=== Ports ===" && netstat -tulpn | grep -E '3000|3001|3002|5432'
```

---

## 🎯 Your Exact Next Steps

Based on your errors, here's what to do RIGHT NOW on the server:

```bash
# 1. SSH to server
ssh root@46.224.231.217

# 2. Run the automated setup script
cd ~/RealEstatesAPI-NestJS
chmod +x SERVER_COMPLETE_SETUP.sh
./SERVER_COMPLETE_SETUP.sh

# 3. Wait for it to complete

# 4. Check status
pm2 status
pm2 logs --lines 30

# 5. Test in browser
# Visit: http://46.224.231.217:3001
```

Done! 🎉
