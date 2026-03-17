# 🚀 Server Startup Commands - Production & Development

## Quick Reference

### Production Server (Hetzner) - PM2 Commands

```bash
# Start all applications
pm2 start all

# OR start individually
pm2 start realestates-api
pm2 start realestates-admin
pm2 start realestates-user

# Stop all
pm2 stop all

# Restart all
pm2 restart all

# View status
pm2 status

# View logs
pm2 logs
pm2 logs realestates-api
pm2 logs realestates-admin --lines 50

# Monitor in real-time
pm2 monit

# Save PM2 configuration
pm2 save

# List all processes
pm2 list
```

---

## 📋 First Time Production Setup

If PM2 is not configured yet, follow these steps:

### 1. Navigate to Project Directory
```bash
cd ~/RealEstatesAPI-NestJS
```

### 2. Install PM2 Globally
```bash
sudo npm install -g pm2
```

### 3. Start Applications with PM2

#### Start Backend API
```bash
cd ~/RealEstatesAPI-NestJS/apps/api
pm2 start dist/main.js --name "realestates-api" --env production
```

#### Start Admin Web Panel
```bash
cd ~/RealEstatesAPI-NestJS/apps/admin-web
pm2 start npm --name "realestates-admin" -- start
```

#### Start User Web Frontend
```bash
cd ~/RealEstatesAPI-NestJS/apps/user-web
pm2 start npm --name "realestates-user" -- start
```

### 4. Save PM2 Configuration
```bash
pm2 save
```

### 5. Enable PM2 to Start on Server Reboot
```bash
pm2 startup
# This will output a command - RUN IT!
# It looks like: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u realestates --hp /home/realestates
```

### 6. Verify Everything is Running
```bash
pm2 status
```

You should see:
```
┌─────┬──────────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name                 │ mode    │ status  │ cpu      │ memory │
├─────┼──────────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ realestates-api      │ fork    │ online  │ 0%       │ 50 MB  │
│ 1   │ realestates-admin    │ fork    │ online  │ 0%       │ 80 MB  │
│ 2   │ realestates-user     │ fork    │ online  │ 0%       │ 90 MB  │
└─────┴──────────────────────┴─────────┴─────────┴──────────┴────────┘
```

---

## 🔄 Update & Redeploy on Server

When you push new code from local to GitHub:

### 1. SSH into Server
```bash
ssh realestates@YOUR_SERVER_IP
# OR
ssh root@YOUR_SERVER_IP
```

### 2. Navigate to Project
```bash
cd ~/RealEstatesAPI-NestJS
```

### 3. Pull Latest Changes from GitHub
```bash
git pull origin main
# OR if using develop branch
git pull origin develop
```

### 4. Install Dependencies (if package.json changed)
```bash
npm install
```

### 5. Build All Applications
```bash
npm run build
```

### 6. Restart PM2 Services
```bash
pm2 restart all
```

### 7. Check Logs for Errors
```bash
pm2 logs --lines 50
```

---

## 🐳 Docker Services Management

### Start Database & Redis
```bash
cd ~/RealEstatesAPI-NestJS
docker-compose up -d
# OR just PostgreSQL
docker-compose up -d postgres
```

### Stop Docker Services
```bash
docker-compose down
```

### View Docker Logs
```bash
docker-compose logs -f
docker-compose logs -f postgres
```

### Restart Docker Services
```bash
docker-compose restart
```

---

## 🏠 Local Development Commands

### Start Everything (Turborepo)
```bash
cd ~/Projects/RealEstatesAPI-NestJS
npm run dev
```

This starts:
- API on port 3000
- Admin Web on port 3001
- User Web on port 3002

### Start Individual Apps

#### API Only
```bash
npm run dev:api
# OR
cd apps/api
npm run start:dev
```

#### Admin Web Only
```bash
npm run dev:admin
# OR
cd apps/admin-web
npm run dev
```

#### User Web Only
```bash
npm run dev:user
# OR
cd apps/user-web
npm run dev
```

#### Start Docker Services
```bash
npm run docker:up
```

---

## 🔧 Troubleshooting Commands

### Check What's Running on Ports
```bash
# Check port 3000 (API)
lsof -i :3000
sudo netstat -tulpn | grep 3000

# Check port 3001 (Admin)
lsof -i :3001

# Check port 3002 (User)
lsof -i :3002
```

### Kill Process on Port
```bash
# Find PID
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Check PM2 Process Health
```bash
pm2 status
pm2 describe realestates-api
```

### Restart Individual Service
```bash
pm2 restart realestates-api
pm2 restart realestates-admin
pm2 restart realestates-user
```

### Delete and Re-add PM2 Service
```bash
# Delete
pm2 delete realestates-api

# Re-add
cd ~/RealEstatesAPI-NestJS/apps/api
pm2 start dist/main.js --name "realestates-api" --env production

# Save
pm2 save
```

---

## 🔐 Environment Variables Check

### View Current Environment
```bash
cat ~/RealEstatesAPI-NestJS/apps/api/.env
```

### Edit Environment File
```bash
nano ~/RealEstatesAPI-NestJS/apps/api/.env
# After editing, restart PM2
pm2 restart all
```

---

## 📊 Monitoring & Logs

### Real-time Process Monitoring
```bash
pm2 monit
```

### View Logs with Filters
```bash
# Last 100 lines
pm2 logs --lines 100

# Follow logs in real-time
pm2 logs --lines 0

# Specific service
pm2 logs realestates-api --lines 50

# Clear old logs
pm2 flush
```

### Check Server Resources
```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU & processes
htop
# OR
top
```

---

## 🚨 Emergency Commands

### If Server is Unresponsive

```bash
# Stop everything
pm2 stop all

# Kill PM2 daemon
pm2 kill

# Restart from saved config
pm2 resurrect

# OR manually restart
cd ~/RealEstatesAPI-NestJS/apps/api
pm2 start dist/main.js --name "realestates-api" --env production
cd ../admin-web
pm2 start npm --name "realestates-admin" -- start
cd ../user-web
pm2 start npm --name "realestates-user" -- start
pm2 save
```

### Reboot Server
```bash
sudo reboot
# PM2 will auto-start if configured with `pm2 startup`
```

---

## 📝 Common Workflows

### Deploy New Feature

```bash
# 1. SSH to server
ssh realestates@YOUR_SERVER_IP

# 2. Navigate to project
cd ~/RealEstatesAPI-NestJS

# 3. Pull changes
git pull origin main

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Restart
pm2 restart all

# 7. Check logs
pm2 logs --lines 30
```

### Run Database Migration

```bash
cd ~/RealEstatesAPI-NestJS/apps/api

# Run migration
npm run migration:run

# Restart API
pm2 restart realestates-api
```

### Rollback to Previous Version

```bash
cd ~/RealEstatesAPI-NestJS

# Check current commit
git log --oneline -5

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild
npm run build

# Restart
pm2 restart all
```

---

## 🎯 Quick Health Check

```bash
# Check all services
pm2 status

# Test API
curl http://localhost:3000/v1/properties/public

# Test Admin Web
curl http://localhost:3001

# Test User Web
curl http://localhost:3002

# Check database
docker-compose ps
```

---

## 📞 Access URLs

### Local Development
- **API**: http://localhost:3000
- **Admin Web**: http://localhost:3001
- **User Web**: http://localhost:3002
- **API Docs**: http://localhost:3000/api/docs

### Production Server
- **API**: http://YOUR_SERVER_IP:3000
- **Admin Web**: http://YOUR_SERVER_IP:3001
- **User Web**: http://YOUR_SERVER_IP:3002

Replace `YOUR_SERVER_IP` with actual IP (e.g., `46.224.231.217`)

---

## 🚀 Quick Fix Script

For common issues (CORS, WebSocket, Git conflicts), use the automated fix script:

```bash
# On the server
cd ~/RealEstatesAPI-NestJS
./scripts/server-quick-fix.sh
```

This script will:
- Backup current configuration
- Update CORS settings for production IP
- Stash uncommitted changes
- Rebuild the API
- Restart all PM2 services
- Show status and logs

---

## 🔗 Related Documentation

- [Fix CORS & WebSocket Issues](./FIX_CORS_WEBSOCKET_GIT.md)
- [Hetzner Deployment Guide](./HETZNER_DEPLOYMENT_GUIDE.md)
- [Production Quick Start](./PRODUCTION_QUICK_START.md)
