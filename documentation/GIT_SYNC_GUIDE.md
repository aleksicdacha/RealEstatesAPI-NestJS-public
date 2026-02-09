# 🔄 Git Sync Guide - Fixing Server/Local Conflicts

## Problem
You made changes directly on the server and now local can't push/server can't pull.

---

## ✅ Solution 1: Force Server to Match Local (Recommended)

Use this when **local has the latest code** you want to keep.

### On Your Local Machine:
```bash
cd ~/Projects/RealEstatesAPI-NestJS

# Make sure you're on the right branch
git checkout develop  # or main

# Make sure local is up to date with commits
git status
git add .
git commit -m "Latest changes from local development"
git push origin develop
```

### On the Server:
```bash
cd ~/RealEstatesAPI-NestJS

# Stop applications first
pm2 stop all

# Backup server changes (just in case)
git stash save "Server changes backup $(date +%Y%m%d_%H%M%S)"

# Force server to match remote
git fetch origin
git reset --hard origin/develop  # or origin/main

# Install and rebuild
npm install
cd packages/types && npm run build && cd ../..
npm run build

# Restart applications
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ Solution 2: Keep Server Changes and Merge

Use this when **server has important changes** you want to keep.

### On the Server:
```bash
cd ~/RealEstatesAPI-NestJS

# Stop applications
pm2 stop all

# Commit server changes
git add .
git commit -m "Server changes - $(date +%Y%m%d_%H%M%S)"

# Pull and merge
git pull origin develop --no-rebase
# Fix any conflicts if they appear

# Rebuild
npm install
cd packages/types && npm run build && cd ../..
npm run build

# Restart
pm2 start ecosystem.config.js
pm2 save

# Push server changes back to remote
git push origin develop
```

### On Your Local Machine:
```bash
cd ~/Projects/RealEstatesAPI-NestJS

# Pull server changes
git pull origin develop
```

---

## ✅ Solution 3: Nuclear Option - Fresh Clone on Server

Use this when **everything is messy** and you just want a clean start.

### On the Server:
```bash
# Stop applications
cd ~/RealEstatesAPI-NestJS
pm2 stop all
pm2 delete all
cd ~

# Backup the old directory
mv RealEstatesAPI-NestJS RealEstatesAPI-NestJS.backup.$(date +%Y%m%d_%H%M%S)

# Clone fresh
git clone <your-repo-url> RealEstatesAPI-NestJS
cd RealEstatesAPI-NestJS
git checkout develop  # or main

# Copy environment file from backup
cp ~/RealEstatesAPI-NestJS.backup.*/apps/api/.env apps/api/.env

# Setup and start
npm install
cd packages/types && npm run build && cd ../..
npm run build

# Start PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it shows
```

---

## 🔍 Check What's Different

Before deciding which solution to use:

### On the Server:
```bash
cd ~/RealEstatesAPI-NestJS

# See what changed on server
git status

# See uncommitted changes
git diff

# See commit history
git log --oneline -10

# Compare with remote
git fetch origin
git log HEAD..origin/develop --oneline  # What's on remote but not local
git log origin/develop..HEAD --oneline  # What's on local but not remote
```

---

## 🎯 Quick Decision Tree

**Q: Did you make important changes on the server?**
- **No** → Use Solution 1 (Force server to match local)
- **Yes, and they're committed** → Use Solution 2 (Merge)
- **Yes, but it's a mess** → Use Solution 3 (Fresh clone)

---

## ⚠️ Common Errors and Fixes

### Error: "Your local changes would be overwritten by merge"
```bash
# Option A: Discard server changes
git reset --hard HEAD
git pull origin develop

# Option B: Save server changes
git stash
git pull origin develop
git stash pop  # This will try to apply your changes
```

### Error: "divergent branches"
```bash
# Option A: Make server match remote exactly
git reset --hard origin/develop

# Option B: Merge
git pull origin develop --no-rebase
```

### Error: "Permission denied (publickey)"
```bash
# Need to setup SSH key
# See: documentation/GITHUB_SSH_SETUP_SERVER.md
```

---

## 📝 Best Practices Going Forward

1. **Never edit code directly on server** - always edit locally and deploy
2. **Use branches** - don't commit directly to main/develop
3. **If you must edit on server** - commit and push immediately
4. **Automate deployments** - use `./scripts/deploy-production.sh`

---

## 🚀 Recommended Workflow

### Local Development:
```bash
# 1. Make changes locally
# 2. Test locally
# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin develop
```

### Deploy to Server:
```bash
# SSH to server
ssh root@46.224.231.217

# Pull and deploy
cd ~/RealEstatesAPI-NestJS
pm2 stop all
git pull origin develop
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
```

Or use the deployment script:
```bash
# From local
./scripts/deploy-production.sh
```
