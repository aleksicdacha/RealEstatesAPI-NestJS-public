# 🚀 Server Startup Commands - PM2

## Complete startup sequence for production server

---

## ✅ Pre-requisites Check

```bash
# Check you're in the right directory
cd ~/RealEstatesAPI-NestJS
pwd  # Should show: /root/RealEstatesAPI-NestJS

# Check if Docker is running
docker ps

# Check if PostgreSQL is running
docker ps | grep postgres
```

---

## 🔧 Step 1: Ensure Everything is Built

```bash
# From project root
cd ~/RealEstatesAPI-NestJS

# Install dependencies if needed
npm install

# Build shared packages first
cd packages/types
npm run build
cd ../..

# Build all apps
npm run build

# Verify builds exist
ls -la apps/api/dist/main.js          # Should exist
ls -la apps/admin-web/.next           # Should exist
ls -la apps/user-web/.next            # Should exist
```

---

## 🚀 Step 2: Start All Apps with PM2

### Option A: Use ecosystem.config.js (Recommended)

```bash
cd ~/RealEstatesAPI-NestJS

# Start all apps at once
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs --lines 50
```

### Option B: Start Each App Individually

```bash
cd ~/RealEstatesAPI-NestJS

# 1. Start API
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production
cd ../..

# 2. Start Admin Web
cd apps/admin-web
pm2 start npm --name "realestates-admin" -- start
cd ../..

# 3. Start User Web
cd apps/user-web
pm2 start npm --name "realestates-user" -- start
cd ../..

# Check status
pm2 status
```

---

## 💾 Step 3: Save PM2 Configuration

```bash
# Save the current process list
pm2 save

# Setup PM2 to start on server reboot
pm2 startup

# Run the command that pm2 startup shows you (it will be something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

## 🔍 Verification Commands

```bash
# Check PM2 status
pm2 status

# Check specific app logs
pm2 logs realestates-api --lines 20
pm2 logs realestates-admin --lines 20
pm2 logs realestates-user --lines 20

# Test API endpoint
curl http://localhost:3000/v1/properties/public

# Test admin web
curl http://localhost:3001

# Test user web
curl http://localhost:3002

# Check if ports are listening
netstat -tulpn | grep -E '3000|3001|3002'
```

---

## 🛑 PM2 Control Commands

```bash
# Stop all apps
pm2 stop all

# Start all apps
pm2 start all

# Restart all apps
pm2 restart all

# Delete all apps from PM2
pm2 delete all

# Stop specific app
pm2 stop realestates-api

# Restart specific app
pm2 restart realestates-api

# View detailed info
pm2 info realestates-api

# Monitor in real-time
pm2 monit
```

---

## 🔄 If You Need to Rebuild and Restart

```bash
cd ~/RealEstatesAPI-NestJS

# Stop all PM2 processes
pm2 stop all

# Pull latest changes (if needed)
git pull origin main

# Rebuild everything
npm install
npm run build

# Restart PM2
pm2 restart all

# Or delete and start fresh
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 🐛 Troubleshooting

### Error: "Script not found: /root/RealEstatesAPI-NestJS/dist/main.js"

**Problem:** API not built

**Solution:**
```bash
cd ~/RealEstatesAPI-NestJS/apps/api
npm install
npm run build
# Verify: ls -la dist/main.js
```

### Error: "No process found" when running `pm2 start all`

**Problem:** PM2 process list is empty

**Solution:**
```bash
# Use ecosystem.config.js instead
pm2 start ecosystem.config.js
```

### CORS Error from Frontend

**Problem:** Backend not allowing frontend origin

**Solution:**
```bash
# Edit API .env file
nano ~/RealEstatesAPI-NestJS/apps/api/.env

# Make sure CORS_ORIGIN includes your server IP:
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002

# Restart API
pm2 restart realestates-api
```

### WebSocket Error (Socket.IO)

**Problem:** Socket.IO CORS not configured

**Solution:**
```bash
# Check apps/api/src/main.ts for Socket.IO CORS configuration
# Should allow origin: http://46.224.231.217:3001

# Restart API after changes
pm2 restart realestates-api
```

---

## 📊 Quick Status Check

```bash
# One-liner to check everything
pm2 status && docker ps && netstat -tulpn | grep -E '3000|3001|3002|5432'
```

This will show:
- PM2 process status
- Docker containers (PostgreSQL, Redis)
- Which ports are listening

---

## 🎯 The Simplest Command (If everything is already built)

```bash
cd ~/RealEstatesAPI-NestJS && pm2 start ecosystem.config.js && pm2 save
```

That's it! 🎉
