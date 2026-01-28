# DDoS Attack Investigation and Fix

## Problem Summary

**Hetzner Alert**: Server making DDoS attack to IP `92.118.207.21` (Danish company)

**Root Cause Identified**: Admin-web frontend geocoding service making **excessive requests** to Overpass API.

---

## Root Cause Analysis

### 1. **Overpass API (overpass-api.de)** - Primary Suspect

The IP `92.118.207.21` likely belongs to one of the Overpass API servers. Overpass API is a read-only API for OpenStreetMap data.

**Location in Code**: `apps/admin-web/src/services/geocoding.service.ts`

```typescript
const response = await axios.post(
  'https://overpass-api.de/api/interpreter',
  overpassQuery,
  {
    headers: {
      'Content-Type': 'text/plain',
    },
    timeout: 5000, // 5 second timeout
  }
);
```

### 2. **When Attacks Occur**

The geocoding service is called **EVERY TIME** an admin user:
- Clicks on the map in property creation/edit wizard
- Drags the marker
- Selects an address from autocomplete
- Opens PropertyMapView component

**File**: `apps/admin-web/src/app/components/wizard-steps/MapSelector.tsx`

Each user interaction triggers:
1. Overpass API call (500m radius search)
2. Nominatim API call (as fallback)
3. Google Geocoding API call

### 3. **DDoS Triggers**

**Scenario 1 - Multiple Admins**: 
- 3-4 admins editing properties simultaneously
- Each map click = 2-3 API calls to Overpass
- If admin drags marker or adjusts location = 10-50 requests/minute

**Scenario 2 - React Re-renders**:
- If MapSelector component re-renders without proper memoization
- useEffect dependencies might trigger loops
- Each render could trigger new API calls

**Scenario 3 - Property List with Maps**:
- PropertyMapView showing all properties on map
- If it calls geocoding for each property = hundreds of requests
- Loading properties page = potential burst of requests

### 4. **Why It's a DDoS**

**Overpass API Fair Use Policy**:
- Max 2 simultaneous requests per IP
- Max ~100 requests per minute recommended
- Violating this = IP ban + DDoS complaint

**Our Current Implementation**:
- NO rate limiting
- NO caching
- NO request deduplication
- NO retry backoff

---

## Immediate Actions Required

### 1. **Add Rate Limiting to Geocoding Service**

Create `apps/admin-web/src/services/geocoding.service.ts` with proper rate limiting:

```typescript
// Rate limiter - max 2 requests per second to Overpass API
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 1000; // 1 second between requests

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.minInterval) {
            await new Promise(res => setTimeout(res, this.minInterval - timeSinceLastRequest));
          }
          
          this.lastRequestTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const task = this.queue.shift();
    
    if (task) {
      await task();
    }
    
    this.processing = false;
    this.processQueue();
  }
}

const overpassRateLimiter = new RateLimiter();
```

### 2. **Add Response Caching**

Cache geocoding results to avoid repeated requests for same coordinates:

```typescript
// Cache geocoding results for 1 hour
const geocodingCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(lat: number, lon: number): string {
  // Round to 5 decimal places (~1.1m precision)
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

function getCached(lat: number, lon: number): string | null {
  const key = getCacheKey(lat, lon);
  const cached = geocodingCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  
  return null;
}

function setCache(lat: number, lon: number, data: string) {
  const key = getCacheKey(lat, lon);
  geocodingCache.set(key, { data, timestamp: Date.now() });
}
```

### 3. **Debounce Map Interactions**

Prevent rapid-fire requests when user drags marker:

```typescript
// In MapSelector.tsx
const debouncedGetNeighborhood = useMemo(
  () => debounce(async (lat: number, lng: number) => {
    const result = await getNeighborhoodFromCoordinates(lat, lng);
    return result;
  }, 1000), // Wait 1 second after user stops dragging
  []
);
```

### 4. **Disable Overpass API (Quick Fix)**

Temporarily disable Overpass API and use only Nominatim:

```typescript
// In geocoding.service.ts - Comment out Overpass API call
export async function getNeighborhoodFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    // TEMPORARILY DISABLED - Causing DDoS
    // const overpassResult = await getPreciseNeighborhood(lat, lon);
    
    // Use only Nominatim
    const nominatimResult = await reverseGeocode(lat, lon);
    if (nominatimResult?.address) {
      return getNeighborhood(nominatimResult.address);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting neighborhood:', error);
    return null;
  }
}
```

---

## Long-Term Solutions

### 1. **Move Geocoding to Backend**

Create NestJS service that handles all geocoding with proper rate limiting:

```typescript
// apps/api/src/entities/geocoding/geocoding.service.ts
@Injectable()
export class GeocodingService {
  private cache = new Map();
  private rateLimiter = new RateLimiter();
  
  async getNeighborhood(lat: number, lon: number): Promise<string> {
    // Check cache
    // Rate limit
    // Call external APIs
    // Return result
  }
}
```

### 2. **Use Self-Hosted Nominatim**

Instead of public APIs, host your own Nominatim instance:

```yaml
# docker-compose.yml
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

### 3. **Pre-compute Neighborhoods**

When property is created, compute neighborhood once and store in database:

```typescript
// Migration to add neighborhood column
await queryRunner.addColumn('property', new TableColumn({
  name: 'computed_neighborhood',
  type: 'varchar',
  isNullable: true
}));
```

### 4. **Request Monitoring**

Add monitoring to track external API usage:

```typescript
// Log every external request
const requestCounter = new Map<string, number>();

function logExternalRequest(service: string) {
  const count = requestCounter.get(service) || 0;
  requestCounter.set(service, count + 1);
  
  if (count > 100) {
    console.error(`WARNING: ${service} has been called ${count} times!`);
  }
}
```

---

## Implementation Priority

**IMMEDIATE (Do Now)**:
1. ✅ Disable Overpass API completely
2. ✅ Add caching to geocoding service
3. ✅ Add debouncing to MapSelector

**SHORT TERM (This Week)**:
4. Move geocoding to backend API
5. Add rate limiting on backend
6. Add monitoring/logging

**LONG TERM (Next Sprint)**:
7. Self-host Nominatim or use paid service
8. Pre-compute neighborhoods on property save
9. Add retry logic with exponential backoff

---

## Testing After Fix

1. Open admin-web in 3 different browsers
2. All users create/edit properties simultaneously
3. Monitor network tab for Overpass API calls
4. Should see:
   - Cached responses for nearby locations
   - Max 1 request per second
   - No repeated requests for same coordinates

---

## Prevention Checklist

- [ ] All external API calls go through backend
- [ ] Rate limiting on all external services
- [ ] Caching for repeated requests
- [ ] Debouncing on user interactions
- [ ] Monitoring/alerting for unusual request volumes
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern for failing services
- [ ] User-Agent headers identifying your app
- [ ] Respect API fair use policies

---

## Contact Overpass API

If you were temporarily banned, contact them:

**Overpass API Support**: https://overpass-api.de/
**Fair Use Policy**: https://dev.overpass-api.de/overpass-doc/en/preface/commons.html

Explain:
- Accidentally made too many requests
- Implemented rate limiting
- Will self-host if needed
- Request IP unban

---

## Alternative Services

If Overpass API blocks your IP permanently:

1. **Nominatim** (OpenStreetMap) - Already used as fallback
2. **Google Geocoding API** - Paid but reliable
3. **Mapbox Geocoding** - Good pricing, 100k free/month
4. **Self-hosted Nominatim** - Full control, no limits
5. **Pelias** - Open source geocoder

---

## Monitoring Commands

Check current request rate from server:

```bash
# On Hetzner server
sudo tcpdump -i any host 92.118.207.21 -c 100
sudo netstat -ntu | grep 92.118.207.21
sudo iftop -f "host 92.118.207.21"
```

Check application logs:

```bash
pm2 logs admin-web | grep "overpass"
pm2 logs api | grep "geocod"
```

---

**Generated**: January 28, 2026
**Priority**: CRITICAL - Fix immediately to avoid server suspension
