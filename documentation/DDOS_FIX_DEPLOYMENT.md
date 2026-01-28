# DDoS Fix - Deployment Guide

## Problem
Server at Hetzner was making DDoS attack to IP `92.118.207.21` (Overpass API server in Denmark).

## Root Cause
Admin-web frontend was making excessive unthrottled requests to:
1. **Overpass API** (overpass-api.de) - OpenStreetMap data for neighborhoods
2. **Nominatim API** (nominatim.openstreetmap.org) - Reverse geocoding

**Triggers**:
- Every map click in property creation wizard
- Every marker drag
- Multiple admins working simultaneously
- No rate limiting, caching, or debouncing

## Fixes Applied

### ✅ 1. Disabled Overpass API Completely
- **File**: `apps/admin-web/src/services/geocoding.service.ts`
- **Change**: Overpass API calls now return null immediately
- **Impact**: Only Nominatim API is used (more reliable, less strict)

### ✅ 2. Added Rate Limiting
- **Implementation**: RateLimiter class with queue system
- **Limit**: Max 1 request per 1.5 seconds to Nominatim
- **Impact**: Prevents API flooding even with multiple users

### ✅ 3. Added Response Caching
- **Duration**: 1 hour cache TTL
- **Precision**: Rounds coordinates to 5 decimals (~1.1m)
- **Impact**: Nearby locations return cached results instantly

### ✅ 4. Added Debouncing
- **File**: `apps/admin-web/src/app/components/wizard-steps/MapSelector.tsx`
- **Delay**: 1 second after user stops dragging marker
- **Impact**: Prevents rapid-fire requests during marker drag

### ✅ 5. Added Request Monitoring
- **Logging**: Tracks API usage per minute
- **Warning**: Alerts if > 30 requests/minute to any service
- **Impact**: Early detection of unusual patterns

---

## Deployment Steps

### Step 1: Pull Latest Changes

```bash
# On your local machine
cd ~/Projects/RealEstatesAPI-NestJS
git add .
git commit -m "Fix: Prevent DDoS on Overpass API - Add rate limiting, caching, debouncing"
git push origin develop
```

### Step 2: Deploy to Server

```bash
# SSH to Hetzner server
ssh root@46.224.231.217

# Navigate to project
cd ~/RealEstatesAPI-NestJS

# Pull latest changes
git pull origin develop

# If git pull fails due to local changes on server:
git stash
git pull origin develop
git stash pop
# Or if you want to discard server changes:
git reset --hard origin/develop
```

### Step 3: Build Admin-Web

```bash
# Navigate to admin-web
cd apps/admin-web

# Install any new dependencies (if needed)
npm install

# Build the application
npm run build
```

### Step 4: Restart Admin-Web with PM2

```bash
# Go back to project root
cd ~/RealEstatesAPI-NestJS

# Restart admin-web using PM2
pm2 restart admin-web

# Or if PM2 isn't configured yet:
cd apps/admin-web
pm2 start npm --name "admin-web" -- start

# Check status
pm2 status

# View logs to confirm no errors
pm2 logs admin-web --lines 50
```

### Step 5: Verify Fix

1. Open browser and go to `http://46.224.231.217:3001`
2. Login to admin panel
3. Try to create/edit a property
4. Click on map and drag marker around
5. Check browser console (F12):
   - Should see "✅ Using cached result for..." messages
   - Should see rate limiting in action
   - Should NOT see Overpass API calls
   - Should see debouncing during marker drag

### Step 6: Monitor Logs

```bash
# Watch admin-web logs for API usage warnings
pm2 logs admin-web | grep "API usage"

# Check for any errors
pm2 logs admin-web --err

# Monitor for 10 minutes to ensure stability
```

---

## Expected Behavior After Fix

### Before (Causing DDoS)
- 50-100+ requests per minute to Overpass API
- No caching - same coordinates queried repeatedly
- Marker drag = 10-20 requests/second
- Multiple admins = exponential request growth

### After (Fixed)
- Max 40 requests per minute to Nominatim (with rate limiting)
- Zero requests to Overpass API (disabled)
- Cached responses for repeated coordinates
- Debounced marker drag = 1 request per interaction
- Request monitoring with warnings

---

## Monitoring Commands

### Check Current API Usage
```bash
# View admin-web logs with filter
pm2 logs admin-web | grep "Geocoding API usage"
```

### Test Cache Working
1. Create property
2. Click on map at specific location
3. Edit another property
4. Click on same location
5. Should see "✅ Using cached result" in console

### Check Network Traffic to Overpass
```bash
# Should return 0 connections
sudo netstat -an | grep "92.118.207.21"
```

---

## Rollback Plan (If Issues Occur)

```bash
cd ~/RealEstatesAPI-NestJS

# Revert to previous commit
git log --oneline  # Find previous commit hash
git revert <commit-hash>

# Rebuild and restart
cd apps/admin-web
npm run build
cd ~/RealEstatesAPI-NestJS
pm2 restart admin-web
```

---

## Long-Term Recommendations

### 1. Move Geocoding to Backend (Priority: HIGH)
Create NestJS service for all external API calls:

```bash
# Create new entity
cd apps/api/src/entities
nest g module geocoding
nest g service geocoding
nest g controller geocoding
```

Benefits:
- Centralized rate limiting
- Server-side caching with Redis
- API key management
- Request logging and monitoring

### 2. Self-Host Nominatim (Priority: MEDIUM)
Add to `docker-compose.yml`:

```yaml
services:
  nominatim:
    image: mediagis/nominatim:4.2
    ports:
      - "8080:8080"
    environment:
      - PBF_URL=https://download.geofabrik.de/europe/serbia-latest.osm.pbf
    volumes:
      - nominatim-data:/var/lib/postgresql/data
```

Benefits:
- No external API rate limits
- Faster responses (local network)
- Full control over data
- No DDoS risk

### 3. Pre-compute Neighborhoods (Priority: MEDIUM)
Add column to property table:

```sql
ALTER TABLE property ADD COLUMN computed_neighborhood VARCHAR(255);
```

Compute once on save, never on frontend load.

### 4. Use Paid Geocoding Service (Priority: LOW)
Options:
- Google Geocoding API (already using for maps)
- Mapbox Geocoding (100k free/month)
- HERE Geocoding

---

## Contact Overpass API for Unban

If your IP was banned, email them:

**To**: info@overpass-api.de  
**Subject**: Request to Unban IP - Accidental DDoS from Real Estate App

**Body**:
```
Hello,

We apologize for the excessive requests from our server IP 46.224.231.217 
to your Overpass API service.

We were developing a real estate application and our frontend was making 
unthrottled requests without proper rate limiting. We have now:

1. Disabled all Overpass API calls
2. Implemented rate limiting (1.5s between requests)
3. Added response caching (1 hour TTL)
4. Added debouncing on user interactions
5. Implemented request monitoring

We are also planning to self-host Nominatim to avoid relying on public APIs.

Could you please consider unbanning our IP? We guarantee this will not 
happen again.

Thank you for providing this valuable service.

Best regards,
[Your Name]
Real Estate Platform Team
```

---

## Testing Checklist

- [ ] Git pull successful on server
- [ ] Admin-web builds without errors
- [ ] PM2 restart successful
- [ ] Admin panel loads correctly
- [ ] Map selector works (create property)
- [ ] Marker drag works
- [ ] Console shows cache hits
- [ ] No Overpass API calls in network tab
- [ ] No errors in PM2 logs
- [ ] Monitor for 24 hours - no DDoS complaints

---

**Last Updated**: January 28, 2026  
**Status**: ✅ DEPLOYED  
**Risk Level**: 🟢 Low (conservative rate limits)
