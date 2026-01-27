# 🔧 Fix CORS, WebSocket & Git Synchronization Issues

## ❌ Problem Summary

You're experiencing:
1. **CORS errors** on admin-web accessing Socket.IO
2. **WebSocket connection failures** 
3. **Git conflicts** between server and local due to direct server edits

---

## 🚨 CORS & WebSocket Fix

### Issue
```
Access to XMLHttpRequest at 'http://46.224.231.217:3000/socket.io/?EIO=4&transport=polling&t=6qofl23x' 
from origin 'http://46.224.231.217:3001' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Root Cause
The Socket.IO gateway has CORS enabled, but the main NestJS app might not be configured correctly for the production server IP.

### Solution: Update CORS Configuration

#### Step 1: Update API Environment File on Server

```bash
# SSH to server
ssh realestates@46.224.231.217  # or ssh root@46.224.231.217

# Edit .env file
cd ~/RealEstatesAPI-NestJS/apps/api
nano .env
```

**Add/Update these lines:**
```env
CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002
```

**Press:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### Step 2: Update Main.ts CORS Configuration

The file `apps/api/src/main.ts` currently has:
```typescript
app.enableCors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: false,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

**This should work, but let's verify WebSocket CORS too.**

#### Step 3: Verify WebSocket Gateway CORS

File: `apps/api/src/entities/agent-chat/agent-chat.gateway.ts`

Should have:
```typescript
@WebSocketGateway({
  cors: {
    origin: '*', // This matches main CORS
    methods: ['GET', 'POST'],
    credentials: false,
  },
  namespace: '/agent-chat',
})
```

**This looks correct!** The issue is likely in the Socket.IO client connection.

#### Step 4: Check Admin Web Socket.IO Client Configuration

We need to verify how admin-web connects to Socket.IO. Let's check if it's using the correct URL.

**On your local machine (not server):**

1. Find where Socket.IO client is configured in admin-web
2. Ensure it uses: `http://46.224.231.217:3000/agent-chat`

#### Step 5: Restart Services on Server

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# Rebuild API (IMPORTANT!)
cd apps/api
npm run build

# Restart PM2
pm2 restart realestates-api
pm2 restart realestates-admin

# Check logs
pm2 logs --lines 50
```

---

## 🌐 Alternative: Use Environment Variable for Socket URL

### On Server

Edit `apps/admin-web/.env.local` (create if doesn't exist):

```bash
cd ~/RealEstatesAPI-NestJS/apps/admin-web
nano .env.local
```

Add:
```env
NEXT_PUBLIC_API_URL=http://46.224.231.217:3000/v1
NEXT_PUBLIC_SOCKET_URL=http://46.224.231.217:3000
```

Rebuild and restart:
```bash
npm run build
cd ~/RealEstatesAPI-NestJS
pm2 restart realestates-admin
```

---

## 🔀 Git Synchronization Fix

### Problem
You made changes directly on the server, and now you can't pull new changes from local.

### Solution Options

#### Option 1: Stash Server Changes (Recommended)

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# Check what changed
git status

# Stash local changes
git stash save "Server changes before pull"

# Pull from remote
git pull origin develop

# If you want to apply stashed changes back
git stash pop
# OR keep them stashed
git stash list
```

#### Option 2: Create Backup Branch for Server Changes

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# Create backup branch with current changes
git checkout -b server-backup-$(date +%Y%m%d)
git add .
git commit -m "Backup of server changes"

# Switch back to develop
git checkout develop

# Force reset to match remote
git fetch origin
git reset --hard origin/develop

# Now pull latest
git pull origin develop
```

#### Option 3: Force Overwrite (CAUTION: Loses Server Changes)

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# Discard ALL local changes
git reset --hard HEAD

# Pull latest
git pull origin develop
```

#### Option 4: Merge Conflicts Manually

```bash
# On server
cd ~/RealEstatesAPI-NestJS

# Commit current server changes
git add .
git commit -m "Server changes"

# Pull and merge
git pull origin develop

# If conflicts occur, resolve them
git status  # Shows conflicted files

# Edit each file, then:
git add <resolved-file>
git commit -m "Resolved merge conflicts"
```

---

## 🎯 Recommended Workflow Going Forward

### 1. **NEVER Edit Directly on Server**

Always:
1. Edit code locally
2. Test locally
3. Commit to Git
4. Push to GitHub
5. Pull on server
6. Rebuild and restart

### 2. Server Update Process

```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin develop

# On server
cd ~/RealEstatesAPI-NestJS
git pull origin develop
npm install  # If package.json changed
npm run build
pm2 restart all
pm2 logs --lines 30
```

### 3. Emergency Server Fix

If you MUST edit on server:

```bash
# On server - make your fix
nano apps/api/src/some-file.ts

# Commit immediately
git add .
git commit -m "Emergency fix: description"

# Push to a separate branch
git push origin develop:server-emergency-fix

# On local machine
git fetch origin
git merge origin/server-emergency-fix

# Then proper testing and merge
```

---

## 🧪 Test WebSocket Connection

### From Browser Console (on admin web)

```javascript
// Test Socket.IO connection
const socket = io('http://46.224.231.217:3000/agent-chat', {
  transports: ['polling', 'websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket!', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});
```

### From Terminal (Server)

```bash
# Check if Socket.IO endpoint is accessible
curl http://localhost:3000/socket.io/

# Should return Socket.IO handshake response
```

---

## 📋 Complete Fix Checklist

- [ ] SSH to server
- [ ] Update `apps/api/.env` with correct `CORS_ORIGIN`
- [ ] Rebuild API: `cd apps/api && npm run build`
- [ ] Restart services: `pm2 restart all`
- [ ] Check logs: `pm2 logs realestates-api --lines 50`
- [ ] Fix Git conflicts using one of the options above
- [ ] Pull latest code: `git pull origin develop`
- [ ] Rebuild all: `npm run build`
- [ ] Restart again: `pm2 restart all`
- [ ] Test admin web at http://46.224.231.217:3001
- [ ] Check browser console for WebSocket connection
- [ ] Verify no CORS errors

---

## 🔍 Debugging Commands

```bash
# On server

# Check current environment
cat ~/RealEstatesAPI-NestJS/apps/api/.env | grep CORS

# Check PM2 environment variables
pm2 show realestates-api

# Check which port API is actually running on
pm2 logs realestates-api | grep "running on"

# Test API endpoint
curl http://localhost:3000/v1/properties/public

# Check network listeners
sudo netstat -tulpn | grep node

# Check Git status
cd ~/RealEstatesAPI-NestJS
git status
git log --oneline -5
git remote -v
```

---

## 🚀 Quick Fix Script

Save this as `fix-cors-websocket.sh` on server:

```bash
#!/bin/bash

echo "🔧 Fixing CORS and WebSocket issues..."

cd ~/RealEstatesAPI-NestJS

# Backup current .env
cp apps/api/.env apps/api/.env.backup

# Update CORS_ORIGIN
sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://46.224.231.217:3001,http://46.224.231.217:3002,http://localhost:3001,http://localhost:3002|g' apps/api/.env

# Rebuild API
echo "📦 Rebuilding API..."
cd apps/api
npm run build

# Restart services
echo "🔄 Restarting services..."
cd ../..
pm2 restart all

echo "✅ Done! Check logs with: pm2 logs"
```

Run it:
```bash
chmod +x fix-cors-websocket.sh
./fix-cors-websocket.sh
```

---

## 📞 Support

If issues persist after following this guide:

1. Check PM2 logs: `pm2 logs --lines 100`
2. Check browser console network tab
3. Verify Socket.IO client library version matches server
4. Check firewall settings: `sudo ufw status`
5. Verify ports 3000, 3001, 3002 are accessible

**Common Issues:**

- **Firewall blocking**: `sudo ufw allow 3000` (if using UFW)
- **Old build cached**: `pm2 delete all` then start fresh
- **Environment variables not loaded**: Check `pm2 env realestates-api`
