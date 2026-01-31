# DDoS Fix - Quick Action Checklist

## 🚨 IMMEDIATE ACTIONS REQUIRED

### ✅ Step 1: Commit Changes (LOCAL)
```bash
cd ~/Projects/RealEstatesAPI-NestJS

# Stage all changes
git add -A

# Commit with detailed message
git commit -m "Fix: Prevent DDoS on Overpass API - Add rate limiting, caching, debouncing"

# Push to GitHub
git push origin develop
```

### ✅ Step 2: Deploy to Server (HETZNER)
```bash
# SSH to server
ssh root@46.224.231.217

# Navigate to project
cd ~/RealEstatesAPI-NestJS

# Pull latest changes
git pull origin develop

# If conflicts due to direct server edits:
git stash
git pull origin develop
# Or to discard server changes:
# git reset --hard origin/develop
```

### ✅ Step 3: Build Admin-Web
```bash
# On Hetzner server
cd ~/RealEstatesAPI-NestJS/apps/admin-web

# Install dependencies (if needed)
npm install

# Build production bundle
npm run build
```

### ✅ Step 4: Restart Services
```bash
# Go to project root
cd ~/RealEstatesAPI-NestJS

# Check PM2 status
pm2 status

# Restart admin-web
pm2 restart admin-web

# If admin-web not in PM2:
cd apps/admin-web
pm2 start npm --name "admin-web" -- start

# View logs
pm2 logs admin-web --lines 50
```

### ✅ Step 5: Verify Fix
```bash
# On server - check for Overpass API connections (should be 0)
sudo netstat -an | grep "92.118.207.21"

# View PM2 logs for monitoring
pm2 logs admin-web | grep "API usage"
```

### ✅ Step 6: Test in Browser
1. Open `http://46.224.231.217:3001`
2. Login to admin panel
3. Create/Edit property
4. Click on map multiple times
5. Drag marker around
6. Open browser console (F12) and verify:
   - ✅ See "✅ Using cached result" messages
   - ✅ See "🗺️ Using Nominatim API" (not Overpass)
   - ✅ Network tab shows NO requests to overpass-api.de
   - ✅ Debouncing works (1 second delay after drag)

---

## 📊 Monitoring (Next 24 Hours)

```bash
# On server - monitor logs periodically
pm2 logs admin-web --lines 100

# Check for warnings
pm2 logs admin-web | grep "WARNING"

# Check API usage stats
pm2 logs admin-web | grep "Geocoding API usage"
```

**Expected Output**:
```
📊 Geocoding API usage (last minute): { overpass: 0, nominatim: 5 }
```

If you see:
```
⚠️ WARNING: High API usage detected! Risk of rate limiting.
```
→ Something is wrong, investigate immediately.

---

## 🔧 Troubleshooting

### Build Fails
```bash
cd ~/RealEstatesAPI-NestJS/apps/admin-web
rm -rf node_modules .next
npm install
npm run build
```

### PM2 Not Found
```bash
npm install -g pm2
```

### Port Already in Use
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill it
sudo kill -9 <PID>

# Restart PM2
pm2 restart admin-web
```

### Still Getting DDoS Complaints
1. Check if user-web also uses geocoding (it shouldn't)
2. Verify Overpass API is truly disabled (check network tab)
3. Consider temporarily blocking outbound connections to 92.118.207.21:
   ```bash
   sudo iptables -A OUTPUT -d 92.118.207.21 -j DROP
   ```

---

## 📧 Contact Overpass API (If Banned)

**Email**: info@overpass-api.de  
**Subject**: Request to Unban IP 46.224.231.217 - Accidental DDoS

**Template**: See `documentation/DDOS_FIX_DEPLOYMENT.md` section "Contact Overpass API for Unban"

---

## 📝 Next Steps (After 24h Monitoring)

- [ ] Monitor server - no DDoS complaints from Hetzner
- [ ] Plan backend geocoding service implementation
- [ ] Consider self-hosted Nominatim setup
- [ ] Add pre-computed neighborhoods to database
- [ ] Review other external API calls in the app

---

## 📚 Documentation References

- `documentation/DDOS_INVESTIGATION_AND_FIX.md` - Technical analysis
- `documentation/DDOS_FIX_DEPLOYMENT.md` - Full deployment guide
- `documentation/DDOS_FIX_SUMMARY.md` - Executive summary

---

**Created**: January 28, 2026  
**Priority**: 🔴 CRITICAL - Deploy ASAP  
**Estimated Time**: 15-20 minutes
