# 🚨 URGENT: Server Deployment Fix Guide

**Date:** January 28, 2026
**Server:** 46.224.231.217
**Issue:** PM2 errors, WebSocket CORS, Git conflicts

---

## 🎯 IMMEDIATE SOLUTION (Copy-Paste on Server)

### Option A: Automated Fix (Recommended)

```bash
# 1. SSH to server
ssh root@46.224.231.217

# 2. Navigate to project
cd ~/RealEstatesAPI-NestJS

# 3. Pull latest fixes from GitHub
git fetch origin develop
git stash  # Save server changes
git pull origin develop --rebase

# 4. Run automated fix script
chmod +x scripts/server-fix.sh
./scripts/server-fix.sh
```

The script will:
- ✅ Handle git conflicts automatically
- ✅ Build all applications
- ✅ Fix CORS configuration
- ✅ Start PM2 with proper config
- ✅ Verify everything works

---

### Option B: Manual Step-by-Step

```bash
# 1. SSH to server
ssh root@46.224.231.217

# 2. Navigate and handle git
cd ~/RealEstatesAPI-NestJS
git stash save "Server changes backup"
git fetch origin develop
git pull origin develop --rebase

# 3. Stop existing processes
pm2 stop all
pm2 delete all

# 4. Install dependencies
npm install

# 5. Build shared packages
cd packages/types && npm run build && cd ../..

# 6. Build all apps
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..

# 7. Check/fix environment
nano apps/api/.env
# Make sure CORS_ORIGIN includes:
# CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

# 8. Start with PM2 ecosystem config
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the command it shows you

# 9. Verify
pm2 status
pm2 logs --lines 30
curl http://localhost:3000/v1/properties/public
```

---

## 🔧 What Was Fixed

### 1. PM2 Configuration (`ecosystem.config.js`)

**Before:** Manual PM2 commands, inconsistent paths
**After:** Centralized PM2 config with proper working directories

```javascript
// Now you can simply run:
pm2 start ecosystem.config.js
// Instead of complex manual commands
```

### 2. WebSocket CORS Issue

**Problem:** 
```
Access to XMLHttpRequest at 'http://46.224.231.217:3000/socket.io/' 
has been blocked by CORS policy
```

**Root Cause:** `CORS_ORIGIN` in `.env` didn't include server IP

**Fix:** Updated `.env` template:
```env
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002
```

The API already has `origin: '*'` in code, but the config service wasn't reading the right origins.

### 3. Git Conflict Handling

**Problem:** Direct edits on server caused pull failures

**Solution:** Automated script with 3 options:
1. Stash server changes (safe)
2. Reset to remote (clean slate)
3. Commit then pull (preserve server work)

### 4. Build Path Issues

**Problem:** `pm2 start dist/main.js` failed because `dist/` wasn't in root

**Fix:** PM2 config now uses correct `cwd` (current working directory):
```javascript
{
  name: 'realestates-api',
  cwd: './apps/api',  // ← This fixes the path
  script: 'dist/main.js'
}
```

---

## 📚 New Documentation Files

| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 process configuration |
| `scripts/server-deploy.sh` | Automated deployment with git handling |
| `scripts/server-fix.sh` | Quick fix for current issues |
| `documentation/SERVER_QUICK_REFERENCE.md` | All server commands in one place |
| `apps/api/.env.production` | Production environment template |
| `apps/admin-web/.env.production` | Admin frontend template |
| `apps/user-web/.env.production` | User frontend template |

---

## 🧪 Testing After Deploy

### 1. Check PM2 Status
```bash
pm2 status
# Should show:
# realestates-api    ✓ online
# realestates-admin  ✓ online  
# realestates-user   ✓ online
```

### 2. Test API
```bash
curl http://localhost:3000/v1/properties/public
# Should return JSON array of properties
```

### 3. Test Admin Web (from browser)
```
http://46.224.231.217:3001
```
- Login should work
- WebSocket errors should be GONE
- Check browser console (F12) - no CORS errors

### 4. Test User Web (from browser)
```
http://46.224.231.217:3002
```
- Homepage should load
- Chatbot WebSocket should connect

### 5. Check Logs
```bash
pm2 logs --lines 50
# Look for:
# ✓ "Listening on port 3000"
# ✓ "Database connected"
# ✗ No "CORS" errors
# ✗ No "ECONNREFUSED" errors
```

---

## 🚨 If Something Goes Wrong

### API Won't Start
```bash
# Check logs
pm2 logs realestates-api --lines 100

# Common fixes:
# 1. Database not running
docker compose up -d postgres

# 2. Missing .env file
cp apps/api/.env.production apps/api/.env
nano apps/api/.env  # Fill in secrets

# 3. Bad build
cd apps/api && npm run build && cd ../..
pm2 restart realestates-api
```

### Frontend Won't Build
```bash
# Check if shared types are built
cd packages/types && npm run build && cd ../..

# Rebuild frontend
cd apps/admin-web && npm run build && cd ../..

# Restart
pm2 restart realestates-admin
```

### Still Getting CORS Errors
```bash
# Verify .env
cat apps/api/.env | grep CORS_ORIGIN

# Should show:
# CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002

# If not, fix it:
nano apps/api/.env
# Then restart:
pm2 restart realestates-api
```

### Nuclear Option (Complete Reset)
```bash
cd ~/RealEstatesAPI-NestJS

# Stop everything
pm2 delete all
docker compose down

# Clean build
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf apps/*/.next apps/*/dist packages/*/dist

# Fresh start
git fetch origin develop
git reset --hard origin/develop
docker compose up -d postgres
sleep 10
npm install
cd packages/types && npm run build && cd ../..
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 Expected PM2 Output

```
┌─────┬────────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name               │ mode    │ status  │ cpu      │ memory │
├─────┼────────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ realestates-api    │ fork    │ online  │ 0%       │ 85 MB  │
│ 1   │ realestates-admin  │ fork    │ online  │ 0%       │ 120 MB │
│ 2   │ realestates-user   │ fork    │ online  │ 0%       │ 115 MB │
└─────┴────────────────────┴─────────┴─────────┴──────────┴────────┘
```

---

## ✅ Final Checklist

After running the fix script:

- [ ] `pm2 status` shows all 3 apps online
- [ ] `pm2 logs` shows no errors
- [ ] `curl http://localhost:3000/v1/properties/public` returns data
- [ ] Admin panel loads at http://46.224.231.217:3001
- [ ] User site loads at http://46.224.231.217:3002
- [ ] No CORS errors in browser console
- [ ] WebSocket connection works in admin panel
- [ ] Chatbot WebSocket works on user site

---

## 🆘 Get More Help

**View comprehensive commands:**
```bash
cat ~/RealEstatesAPI-NestJS/documentation/SERVER_QUICK_REFERENCE.md
```

**Key commands quick access:**
```bash
# Logs
pm2 logs
pm2 logs realestates-api --lines 50

# Monitoring
pm2 monit

# Restart
pm2 restart all

# Status
pm2 status
pm2 show realestates-api
```

---

**Last Updated:** January 28, 2026
**Status:** ✅ All fixes committed to `develop` branch
**Next Step:** Pull on server and run deployment script

