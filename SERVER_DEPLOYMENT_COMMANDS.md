# Server Deployment Commands - DDoS Fix
**Date**: January 28, 2026  
**Server**: 46.224.231.217  
**Purpose**: Deploy DDoS prevention fixes and resolve git conflicts

---

## Quick Start (3 Steps)

### 1️⃣ Connect to Server
```bash
ssh root@46.224.231.217
```

### 2️⃣ Fix Git Conflict
```bash
cd ~/RealEstatesAPI-NestJS
./fix-server-git-conflict.sh
```

### 3️⃣ Deploy DDoS Fixes
```bash
./deploy-ddos-fix.sh
```

---

## Detailed Step-by-Step Guide

### Step 1: Fix Git Conflict on Server

The server has local changes that diverged from the remote branch. Here's how to resolve it:

```bash
# Connect to server
ssh root@46.224.231.217

# Navigate to project
cd ~/RealEstatesAPI-NestJS

# Check current status
git status
git branch

# Option A: Use the automated script (RECOMMENDED)
./fix-server-git-conflict.sh

# Option B: Manual resolution
# Create backup
git branch "server-backup-$(date +%Y%m%d-%H%M%S)"

# Stash local changes
git stash save "Server changes $(date)"

# Configure merge strategy
git config pull.rebase false

# Pull latest changes
git pull origin develop

# Check if you want to apply stashed changes
git stash list
# git stash pop  # Only if you need local changes
```

**Expected Output**:
- ✅ Backup branch created
- ✅ Changes stashed
- ✅ Remote changes pulled successfully
- ✅ On branch: develop
- ✅ Up to date with origin/develop

---

### Step 2: Verify Latest Code

```bash
# Check that you have the latest DDoS fixes
ls -la deploy-ddos-fix.sh
# Should exist and be executable

# Verify the modified files exist
ls -la apps/admin-web/src/services/geocoding.service.ts
ls -la apps/api/src/entities/newsletter-subscriber/newsletter-subscriber.service.ts

# Check git log
git log --oneline -10
# Should see commits related to DDoS fix
```

---

### Step 3: Deploy to Production

```bash
# Make deployment script executable (if needed)
chmod +x deploy-ddos-fix.sh

# Run deployment
./deploy-ddos-fix.sh

# The script will:
# 1. Create backup
# 2. Check for Overpass connections
# 3. Stop PM2 services
# 4. Install dependencies
# 5. Build all apps (API, Admin, User)
# 6. Restart PM2 services
# 7. Verify deployment
# 8. Show monitoring instructions
```

**Expected Duration**: 5-10 minutes

---

### Step 4: Verify Deployment

#### Check PM2 Services
```bash
pm2 status
```
**Expected**:
```
┌─────┬────────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                   │ mode    │ status  │ restart  │
├─────┼────────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ realestates-api        │ fork    │ online  │ 0        │
│ 1   │ realestates-admin      │ fork    │ online  │ 0        │
│ 2   │ realestates-user       │ fork    │ online  │ 0        │
└─────┴────────────────────────┴─────────┴─────────┴──────────┘
```

#### Check for Overpass Connections (CRITICAL)
```bash
sudo netstat -an | grep "92.118.207.21"
```
**Expected**: No output (0 connections)

#### Test API
```bash
curl http://localhost:3000/v1/properties/public?page=1&limit=1
```
**Expected**: JSON response with property data

#### Check Logs
```bash
pm2 logs --lines 50
```
**Look for**:
- ✅ No errors
- ✅ Services started successfully
- ✅ No connection attempts to 92.118.207.21

---

### Step 5: Monitor for 10 Minutes

```bash
# Watch for Overpass connections in real-time
watch -n 60 'sudo netstat -an | grep "92.118.207.21" | wc -l'
```
**Should always show**: 0

Press `Ctrl+C` to exit.

---

## Verification Checklist

After deployment, verify these items:

- [ ] All 3 PM2 services online (pm2 status)
- [ ] No Overpass connections (netstat check)
- [ ] API responds to curl test
- [ ] No errors in pm2 logs
- [ ] Admin panel accessible at http://46.224.231.217:3001
- [ ] User website accessible at http://46.224.231.217:3002
- [ ] Can create/edit properties in admin panel
- [ ] Geocoding works (test by editing property address)

---

## Troubleshooting

### Git Pull Still Fails
```bash
# Force merge strategy
git config pull.rebase false
git pull origin develop --allow-unrelated-histories
```

### Build Fails
```bash
# Clean node_modules and rebuild
cd apps/api && rm -rf node_modules && npm install && npm run build
cd ../admin-web && rm -rf node_modules && npm install && npm run build
cd ../user-web && rm -rf node_modules && npm install && npm run build
```

### PM2 Services Won't Start
```bash
# Check if ports are in use
sudo netstat -tulpn | grep -E ':(3000|3001|3002)'

# Kill processes if needed
pm2 delete all
pm2 kill

# Restart
cd apps/api && pm2 start dist/main.js --name "realestates-api" --env production
cd ../admin-web && pm2 start npm --name "realestates-admin" -- start
cd ../user-web && pm2 start npm --name "realestates-user" -- start
pm2 save
```

### Still See Overpass Connections
```bash
# Emergency block
sudo iptables -A OUTPUT -d 92.118.207.21 -j DROP
sudo iptables-save > /etc/iptables/rules.v4

# Then investigate logs
pm2 logs --lines 1000 | grep -i overpass
pm2 logs --lines 1000 | grep "92.118.207.21"
```

---

## Rollback Procedure

If deployment fails critically:

```bash
# Stop services
pm2 stop all

# Checkout backup
git checkout backup-before-ddos-fix-$(date +%Y%m%d)

# Rebuild
cd apps/api && npm run build
cd ../admin-web && npm run build
cd ../user-web && npm run build

# Restart
pm2 restart all
```

---

## Post-Deployment Monitoring

### Immediate (First Hour)
```bash
# Check every 5 minutes
sudo netstat -an | grep "92.118.207.21" | wc -l
pm2 status
pm2 logs --lines 20
```

### Daily (First Week)
```bash
# Security report
echo "=== Daily Security Report ===" > /tmp/security-report.txt
echo "Date: $(date)" >> /tmp/security-report.txt
echo "Overpass Connections:" >> /tmp/security-report.txt
sudo netstat -an | grep "92.118.207.21" | wc -l >> /tmp/security-report.txt
echo "Rate Limit Events:" >> /tmp/security-report.txt
pm2 logs realestates-api --lines 5000 --nostream | grep "Too Many Requests" | wc -l >> /tmp/security-report.txt
echo "API Errors:" >> /tmp/security-report.txt
pm2 logs realestates-api --lines 5000 --nostream | grep ERROR | wc -l >> /tmp/security-report.txt
cat /tmp/security-report.txt
```

---

## Success Criteria

✅ **Deployment Successful When**:
1. All PM2 services running (no restarts)
2. Zero Overpass connections for 10 minutes
3. API health check passes
4. No errors in logs
5. Admin can edit properties
6. Geocoding uses Nominatim (check logs)
7. Newsletter sending shows batch processing logs

✅ **DDoS Issue Resolved When**:
1. No Hetzner abuse alerts for 24 hours
2. Zero connections to 92.118.207.21 for 24 hours
3. Rate limiting prevents bursts (test with curl)
4. Newsletter sends max 50 emails per batch

---

## Important Notes

⚠️ **DO NOT**:
- Delete backup branches for 7 days
- Modify code directly on server after deployment
- Disable rate limiting
- Remove batch processing from newsletter

✅ **DO**:
- Monitor logs daily for first week
- Keep backups of working states
- Test rate limiting weekly
- Check for Hetzner alerts

---

## Contact & References

**Documentation**:
- Full Investigation: `documentation/DDOS_INVESTIGATION_SUMMARY.md`
- Security Analysis: `documentation/DDOS_SECURITY_ANALYSIS.md`
- Deployment Checklist: `documentation/DDOS_FIX_DEPLOYMENT_CHECKLIST.md`
- Quick Reference: `QUICK_REFERENCE_DDOS_FIX.txt`

**Hetzner Console**: https://console.hetzner.cloud/  
**Problem IP**: 92.118.207.21 (Overpass API - Danish company)  
**Server IP**: 46.224.231.217

---

**Last Updated**: January 28, 2026  
**Status**: ✅ Ready for Deployment
