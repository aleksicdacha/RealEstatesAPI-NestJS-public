# Server Deployment Scripts - Quick Reference

## Overview

This directory contains scripts to deploy and manage the Real Estate Platform on production server.

---

## Scripts Available

### 1. `SERVER_COMPLETE_SETUP.sh` ⭐ (Main Deployment Script)

**Location**: Root directory
**Run on**: Server
**Purpose**: Complete setup including git pull, build, and PM2 start

```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
./SERVER_COMPLETE_SETUP.sh
```

**What it does**:
- ✅ Checks environment files
- ✅ Starts Docker services
- ✅ Installs dependencies
- ✅ Builds all packages and apps
- ✅ Starts PM2 processes
- ✅ Saves PM2 configuration

**Use when**: You have latest code on server and just need to rebuild and restart.

---

### 2. `SERVER_MANUAL_DEPLOY.sh` (No Git Required)

**Location**: Root directory
**Run on**: Server
**Purpose**: Deploy without dealing with git - just build and start

```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
./SERVER_MANUAL_DEPLOY.sh
```

**What it does**:
- ✅ Stops all PM2 processes
- ✅ Starts Docker services
- ✅ Cleans old builds
- ✅ Installs dependencies
- ✅ Builds everything from scratch
- ✅ Starts PM2 processes

**Use when**: You have git conflicts or don't want to deal with git pull.

---

### 3. `SERVER_GIT_FIX.sh` (Git Conflict Helper)

**Location**: Root directory
**Run on**: Server
**Purpose**: Resolve git conflicts before deployment

```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
./SERVER_GIT_FIX.sh
```

**What it does**:
- ✅ Shows current git status
- ✅ Offers 4 resolution options:
  1. Stash changes and pull (recommended)
  2. Create backup branch and pull (safe)
  3. Force reset to origin (danger)
  4. Cancel and handle manually

**Use when**: You get git conflict errors when trying to pull code.

---

### 4. `scripts/deploy-to-production.sh` (From Local Machine)

**Location**: `scripts/` directory
**Run on**: Your local machine
**Purpose**: Deploy from local machine to server in one command

```bash
# From your local machine
cd ~/Projects/RealEstatesAPI-NestJS
./scripts/deploy-to-production.sh
```

**What it does**:
- ✅ Commits your local changes (if any)
- ✅ Pushes to GitHub
- ✅ SSHs to server
- ✅ Pulls latest code
- ✅ Runs SERVER_COMPLETE_SETUP.sh on server

**Use when**: You want to deploy from your local machine automatically.

---

## Common Scenarios

### Scenario 1: Normal Deployment (No Issues)

**From Local Machine**:
```bash
git add .
git commit -m "Your changes"
git push origin develop
./scripts/deploy-to-production.sh
```

**From Server**:
```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
git pull origin develop
./SERVER_COMPLETE_SETUP.sh
```

---

### Scenario 2: Git Conflicts on Server

**Step 1**: Fix git conflicts
```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
./SERVER_GIT_FIX.sh  # Choose option 1 or 2
```

**Step 2**: Deploy
```bash
./SERVER_COMPLETE_SETUP.sh
```

**OR skip git entirely**:
```bash
./SERVER_MANUAL_DEPLOY.sh
```

---

### Scenario 3: PM2 is Empty (No Processes Running)

This means builds are missing or PM2 lost its configuration.

**Solution**:
```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
./SERVER_MANUAL_DEPLOY.sh
```

This will rebuild everything and start PM2 processes.

---

### Scenario 4: WebSocket CORS Errors

**Step 1**: Make sure latest code is deployed
```bash
ssh root@46.224.231.217
cd ~/RealEstatesAPI-NestJS
git pull origin develop
./SERVER_COMPLETE_SETUP.sh
```

**Step 2**: Verify API is running
```bash
pm2 logs realestates-api --lines 50
```

**Step 3**: Check if Socket.IO endpoint responds
```bash
curl -i http://46.224.231.217:3000/socket.io/?EIO=4&transport=polling
```

Should return `200 OK` with CORS headers.

---

### Scenario 5: Docker Issues

**Check Docker status**:
```bash
docker compose ps
```

**Restart Docker services**:
```bash
docker compose down
docker compose up -d
```

**Check Docker logs**:
```bash
docker compose logs -f postgres
```

---

## PM2 Quick Commands

### Check Status
```bash
pm2 status
pm2 list
```

### View Logs
```bash
pm2 logs                      # All apps
pm2 logs realestates-api      # API only
pm2 logs realestates-admin    # Admin only
pm2 logs realestates-user     # User only
pm2 logs --lines 100          # Last 100 lines
```

### Restart Apps
```bash
pm2 restart all               # All apps
pm2 restart realestates-api   # API only
```

### Stop/Start Apps
```bash
pm2 stop all
pm2 start ecosystem.config.js
pm2 save
```

### Monitor in Real-time
```bash
pm2 monit
```

### Delete All and Start Fresh
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## Environment Files Checklist

Before deploying, ensure these files exist and have correct values:

### ✅ apps/api/.env
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=estates
JWT_SECRET=your_jwt_secret_min_32_chars
NODE_ENV=production
PORT=3000
```

### ✅ apps/admin-web/.env.production
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_WS_URL=http://46.224.231.217:3000
NODE_ENV=production
PORT=3001
```

### ✅ apps/user-web/.env.production
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=production
PORT=3002
```

---

## Troubleshooting

### Issue: "docker-compose: command not found"

**Fix**: Script now auto-detects and uses either `docker compose` or `docker-compose`.

If both fail, install Docker Compose:
```bash
apt update && apt install docker-compose-plugin
```

---

### Issue: "Script not found: dist/main.js"

**Cause**: API build failed or doesn't exist.

**Fix**:
```bash
cd ~/RealEstatesAPI-NestJS
./SERVER_MANUAL_DEPLOY.sh
```

This will rebuild everything from scratch.

---

### Issue: Git says "Your branch has diverged"

**Fix**:
```bash
cd ~/RealEstatesAPI-NestJS
./SERVER_GIT_FIX.sh
```

Choose option 1 (stash) or option 2 (backup branch).

---

### Issue: Changes not reflecting on website

**Fix**:
```bash
# 1. Rebuild and restart
./SERVER_MANUAL_DEPLOY.sh

# 2. Clear browser cache
# In browser: Ctrl+Shift+R (hard refresh)

# 3. Check if correct build is running
pm2 logs realestates-admin --lines 20
```

---

## Access URLs

After successful deployment, apps are available at:

- **API**: http://46.224.231.217:3000
- **API Docs**: http://46.224.231.217:3000/api/docs
- **Admin Panel**: http://46.224.231.217:3001
- **User Website**: http://46.224.231.217:3002

---

## First Time Setup on New Server

If deploying to a fresh server:

```bash
# 1. Clone repository
git clone git@github.com:your-username/RealEstatesAPI-NestJS.git
cd RealEstatesAPI-NestJS

# 2. Create environment files
cp apps/api/.env.example apps/api/.env
nano apps/api/.env  # Edit with your values

# 3. Make scripts executable
chmod +x SERVER_COMPLETE_SETUP.sh
chmod +x SERVER_MANUAL_DEPLOY.sh
chmod +x SERVER_GIT_FIX.sh

# 4. Run setup
./SERVER_COMPLETE_SETUP.sh

# 5. Setup PM2 to start on boot
pm2 startup
# Run the command it shows you
pm2 save
```

---

## Need Help?

Check the detailed documentation:
- `documentation/SERVER_DEPLOYMENT_FIX.md` - Complete troubleshooting guide
- `documentation/PRODUCTION_QUICK_START.md` - Production setup guide
- `documentation/HETZNER_DEPLOYMENT_GUIDE.md` - Hetzner-specific deployment

Or view PM2 logs for errors:
```bash
pm2 logs --lines 100
```
