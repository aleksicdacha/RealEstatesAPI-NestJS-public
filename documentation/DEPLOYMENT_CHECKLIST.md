# Deployment Checklist - January 28, 2026

## Current Situation
- **Issue**: Git divergent branches on server (local changes conflict with remote)
- **Additional Issue**: WebSocket CORS errors on admin-web
- **DDoS Fix**: Deployed to prevent connections to 92.118.207.21 (Overpass API)
- **Status**: Services need to be restarted with latest code

## Pre-Deployment Checklist

- [x] DDoS fixes committed to develop branch
- [x] WebSocket CORS configuration updated
- [x] Rate limiting configured
- [x] External API caching implemented
- [x] Deployment scripts created
- [ ] Server git conflicts resolved
- [ ] Services built and started
- [ ] Verification tests passed

## Deployment Steps

### On LOCAL Machine (Already Done)
```bash
✅ Created DDoS fixes
✅ Committed to develop branch
✅ Pushed to GitHub
```

### On SERVER (To Do Now)

#### Step 1: Run the Deployment Script
```bash
cd ~/RealEstatesAPI-NestJS
chmod +x SERVER_FIX_AND_DEPLOY.sh
./SERVER_FIX_AND_DEPLOY.sh
```

This script will:
1. Create backup of current state
2. Fix git divergence (merge develop)
3. Stop all services
4. Install dependencies
5. Build all apps (API, Admin-web, User-web)
6. Start Docker services
7. Run database migrations
8. Start PM2 services
9. Run verification checks

#### Step 2: Manual Verification (If Script Fails)

**Fix Git Manually:**
```bash
cd ~/RealEstatesAPI-NestJS
git config pull.rebase false
git pull origin develop --no-edit
```

**If Merge Conflicts:**
```bash
# Accept incoming changes for DDoS fixes
git checkout --theirs apps/api/src/main.ts
git checkout --theirs apps/api/src/common/filters/http-exception.filter.ts
git checkout --theirs apps/user-web/next.config.ts
git add -A
git commit -m "Merged develop with server changes"
```

**Build and Start Manually:**
```bash
# Stop services
pm2 delete all
docker compose down

# Install dependencies
npm install
cd apps/api && npm install && cd ../..
cd apps/admin-web && npm install && cd ../..
cd apps/user-web && npm install && cd ../..

# Build
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..

# Start Docker
docker compose up -d

# Start PM2
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production
cd ../admin-web
pm2 start npm --name "realestates-admin" -- start
cd ../user-web
pm2 start npm --name "realestates-user" -- start
cd ../..
pm2 save
```

## Post-Deployment Verification

### 1. Check Services Running
```bash
pm2 status
docker compose ps
```

Expected output:
- realestates-api: online
- realestates-admin: online
- realestates-user: online
- PostgreSQL container: Up
- Redis container: Up

### 2. Check for DDoS Connections
```bash
sudo netstat -an | grep "92.118.207.21" | wc -l
```

Expected: `0` (no connections to Overpass API)

### 3. Test API Endpoint
```bash
curl http://localhost:3000/v1/properties/public?page=1&limit=1
```

Expected: JSON response with properties

### 4. Test Admin-web
```bash
curl -I http://localhost:3001
```

Expected: HTTP 200 OK

### 5. Test User-web
```bash
curl -I http://localhost:3002
```

Expected: HTTP 200 OK

### 6. Check Logs for Errors
```bash
pm2 logs --lines 50
```

Expected: No critical errors, no "ECONNREFUSED" to Overpass

### 7. Test WebSocket Connection (Admin)

From browser console on `http://46.224.231.217:3001`:
```javascript
const socket = io('http://46.224.231.217:3000');
socket.on('connect', () => console.log('WebSocket connected!'));
socket.on('error', (err) => console.error('WebSocket error:', err));
```

Expected: "WebSocket connected!" message

### 8. Monitor for 10 Minutes
```bash
# In one terminal
pm2 logs

# In another terminal
watch -n 5 'sudo netstat -an | grep "92.118.207.21" | wc -l'
```

Expected: Connection count stays at 0

## Success Criteria

- [ ] All PM2 services show "online" status
- [ ] Docker services running (PostgreSQL, Redis)
- [ ] API responds to test endpoint (HTTP 200)
- [ ] Admin-web loads successfully (HTTP 200)
- [ ] User-web loads successfully (HTTP 200)
- [ ] WebSocket connections work (no CORS errors)
- [ ] No connections to 92.118.207.21 (Overpass API)
- [ ] No errors in PM2 logs
- [ ] Rate limiting active (check X-RateLimit headers)

## Rollback Procedure (If Needed)

```bash
# Stop current services
pm2 delete all

# Checkout backup branch
git checkout server-backup-YYYYMMDD

# Rebuild and restart
npm install
cd apps/api && npm run build && cd ../..
pm2 start apps/api/dist/main.js --name "realestates-api"
pm2 start npm --name "realestates-admin" --cwd apps/admin-web -- start
pm2 start npm --name "realestates-user" --cwd apps/user-web -- start
pm2 save
```

## Monitoring (Next 24 Hours)

### Every Hour
```bash
# Check DDoS connections
sudo netstat -an | grep "92.118.207.21" | wc -l

# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs --lines 20
```

### Automated Monitoring Script
```bash
#!/bin/bash
# Save as monitor-ddos.sh

while true; do
    COUNT=$(sudo netstat -an | grep "92.118.207.21" | wc -l)
    if [ "$COUNT" -gt 0 ]; then
        echo "[$(date)] WARNING: $COUNT connections to Overpass API detected!"
        pm2 logs --lines 50 >> /tmp/ddos-alert.log
    else
        echo "[$(date)] OK: No Overpass connections"
    fi
    sleep 300  # Check every 5 minutes
done
```

Run in background:
```bash
chmod +x monitor-ddos.sh
nohup ./monitor-ddos.sh > /tmp/ddos-monitor.log 2>&1 &
```

## Contact Hetzner (If DDoS Persists)

Email: abuse@hetzner.com

Subject: "DDoS Issue Resolution - Server [Your IP]"

Body:
```
Dear Hetzner Support,

We have identified and fixed the DDoS issue on our server.

Actions taken:
1. Disabled automatic geocoding to Overpass API (92.118.207.21)
2. Implemented rate limiting (10 req/min per IP)
3. Added request caching to prevent repeated external API calls
4. Restarted all services with updated code

Monitoring:
- No connections to 92.118.207.21 detected since deployment
- Services restarted at: [TIMESTAMP]
- Continuous monitoring active

Please confirm if you see any further suspicious traffic.

Thank you,
[Your Name]
```

## Files Created/Modified

### New Files
- `/home/dalibor/Projects/RealEstatesAPI-NestJS/SERVER_FIX_AND_DEPLOY.sh` - Main deployment script
- `/home/dalibor/Projects/RealEstatesAPI-NestJS/documentation/SERVER_COMMANDS.md` - Command reference
- `/home/dalibor/Projects/RealEstatesAPI-NestJS/documentation/DEPLOYMENT_CHECKLIST.md` - This file

### Modified Files (DDoS Fixes)
- `apps/api/src/main.ts` - Rate limiting, CORS, compression
- `apps/api/src/common/filters/http-exception.filter.ts` - Error logging
- `apps/api/src/entities/property/property.service.ts` - Removed Overpass calls, added caching
- `apps/user-web/next.config.ts` - Image optimization settings
- `apps/api/src/common/decorators/rate-limit.decorator.ts` - NEW: Rate limiting decorator
- `apps/api/src/common/guards/rate-limit.guard.ts` - NEW: Rate limit guard

## Next Steps After Successful Deployment

1. **24-hour monitoring** - Verify no DDoS connections
2. **Performance testing** - Ensure rate limiting doesn't block legitimate users
3. **Update documentation** - Mark deployment as complete
4. **Notify Hetzner** - Send confirmation email
5. **Create nginx reverse proxy** - For better security (optional)
6. **Setup SSL certificates** - Use Let's Encrypt (optional)
7. **Configure firewall** - Block unnecessary outbound connections

## Notes

- Backup branch created: `server-backup-[timestamp]`
- All local changes stashed before merge
- Overpass API geocoding permanently disabled
- Geocoding now uses Google Maps API with caching
- Rate limiting: 10 requests/min per IP on property endpoints
- WebSocket CORS configured for admin-web connection
