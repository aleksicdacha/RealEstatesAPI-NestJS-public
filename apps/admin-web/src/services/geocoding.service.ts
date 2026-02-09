import axios from 'axios';

// ===========================
// RATE LIMITER - Prevent DDoS
// ===========================
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 1500; // 1.5 seconds between requests (conservative)

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

const nominatimRateLimiter = new RateLimiter();
// overpassRateLimiter removed - Overpass API is disabled

// ===========================
// CACHING - Avoid Repeated Requests
// ===========================
const geocodingCache = new Map<string, { data: string | null; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(lat: number, lon: number): string {
  // Round to 5 decimal places (~1.1m precision) to increase cache hits
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

function getCached(lat: number, lon: number): string | null {
  const key = getCacheKey(lat, lon);
  const cached = geocodingCache.get(key);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('✅ Using cached result for', key);
    return cached.data;
  }

  return null;
}

function setCache(lat: number, lon: number, data: string | null) {
  const key = getCacheKey(lat, lon);
  geocodingCache.set(key, { data, timestamp: Date.now() });
  console.log('💾 Cached result for', key);
}

// Request counter for monitoring
let requestCounter = { overpass: 0, nominatim: 0 };
setInterval(() => {
  if (requestCounter.overpass > 0 || requestCounter.nominatim > 0) {
    console.log('📊 Geocoding API usage (last minute):', requestCounter);
    if (requestCounter.overpass > 30 || requestCounter.nominatim > 30) {
      console.warn('⚠️ WARNING: High API usage detected! Risk of rate limiting.');
    }
  }
  requestCounter = { overpass: 0, nominatim: 0 };
}, 60000);

export interface LocationInfo {
  // Fine-grained location data (most specific)
  road?: string;
  house_number?: string;
  neighbourhood?: string;  // Local neighborhood (e.g., "Duvanjište", "Bubanj")
  suburb?: string;         // Suburb or district
  quarter?: string;        // Quarter/area
  city_district?: string;  // City district
  borough?: string;        // Borough
  
  // Administrative areas (less specific)
  city?: string;
  town?: string;
  municipality?: string;
  state?: string;
  county?: string;
  region?: string;
  country?: string;
  
  // Additional fields that might contain neighborhood info
  residential?: string;
  commercial?: string;
  industrial?: string;
  retail?: string;
}

export interface ReverseGeocodeResult {
  address: LocationInfo;
  display_name: string;
}

/**
 * Get precise neighborhood using Overpass API (OpenStreetMap data)
 * This queries for place=neighbourhood tags which are more granular
 *
 * ⚠️ TEMPORARILY DISABLED - This was causing DDoS attacks on Overpass API
 * IP 92.118.207.21 (Danish company) reported excessive requests
 * Will re-enable with proper backend rate limiting
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getPreciseNeighborhood(lat: number, lon: number): Promise<string | null> {
  // DISABLED TO PREVENT DDOS - Use Nominatim fallback only
  console.log('⚠️ Overpass API disabled - using Nominatim fallback');
  return null;

  /* ORIGINAL CODE - KEEP FOR FUTURE RE-ENABLING
  try {
    requestCounter.overpass++;

    // Check cache first
    const cachedResult = getCached(lat, lon);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Rate limit the request
    const result = await overpassRateLimiter.schedule(async () => {
      // Search for nearby places tagged as neighbourhoods within 500m radius
      const overpassQuery = `
        [out:json][timeout:5];
        (
          node["place"="neighbourhood"](around:500,${lat},${lon});
          node["place"="suburb"](around:500,${lat},${lon});
          node["place"="quarter"](around:500,${lat},${lon});
        );
        out body;
      `;

      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        overpassQuery,
        {
          headers: {
            'Content-Type': 'text/plain',
            'User-Agent': 'RealEstateApp/1.0 (contact: admin@yourdomain.com)' // Identify your app
          },
          timeout: 5000, // 5 second timeout
        }
      );

      if (response.data.elements && response.data.elements.length > 0) {
        // Get the closest neighbourhood
        const element = response.data.elements[0];
        // Prioritize Latin script name
        const name = element.tags?.['name:sr-Latn'] || element.tags?.['name:en'] || element.tags?.name || element.tags?.['name:sr'];

        console.log('Overpass API found neighbourhood:', name);
        // Convert to Latin if needed
        const converted = name ? cyrillicToLatin(name) : null;
        setCache(lat, lon, converted);
        return converted;
      }

      setCache(lat, lon, null);
      return null;
    });

    return result;
  } catch (error) {
    // Don't log error for timeout - it's expected sometimes
    if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
      console.log('Overpass API timeout, falling back to Nominatim');
    } else {
      console.error('Error in Overpass API query:', error);
    }
    return null;
  }
  */
}

/**
 * Get location details from coordinates using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    requestCounter.nominatim++;

    // Rate limit the request
    return await nominatimRateLimiter.schedule(async () => {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json',
          addressdetails: 1,
          zoom: 18, // Higher zoom for more detailed results (18 = building level)
          'accept-language': 'sr-Latn,en', // Prefer Latin Serbian, fallback to English
        },
        headers: {
          'User-Agent': 'RealEstateApp/1.0 (contact: admin@yourdomain.com)', // Required by Nominatim
        },
        timeout: 8000, // 8 second timeout
      });

      // Log the full response to see what data we're getting
      console.log('Nominatim response for coordinates:', lat, lon);
      console.log('Address details:', response.data.address);

      return response.data;
    });
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

/**
 * Get coordinates from address using Nominatim (OpenStreetMap)
 */
export async function geocodeAddress(address: string, city: string = 'Niš'): Promise<{ lat: number; lon: number } | null> {
  try {
    requestCounter.nominatim++;

    // Rate limit the request
    return await nominatimRateLimiter.schedule(async () => {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: `${address}, ${city}, Serbia`,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          'accept-language': 'sr-Latn,en', // Prefer Latin Serbian, fallback to English
        },
        headers: {
          'User-Agent': 'RealEstateApp/1.0 (contact: admin@yourdomain.com)',
        },
        timeout: 8000, // 8 second timeout
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
      }

      return null;
    });
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
}

/**
 * Convert Cyrillic to Latin script for Serbian text
 */
function cyrillicToLatin(text: string): string {
  const cyrillicToLatinMap: { [key: string]: string } = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
    'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Ђ': 'Đ', 'ђ': 'đ',
    'Е': 'E', 'е': 'e', 'Ж': 'Ž', 'ж': 'ž', 'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i', 'Ј': 'J', 'ј': 'j', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'Љ': 'Lj', 'љ': 'lj', 'М': 'M', 'м': 'm',
    'Н': 'N', 'н': 'n', 'Њ': 'Nj', 'њ': 'nj', 'О': 'O', 'о': 'o',
    'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
    'Т': 'T', 'т': 't', 'Ћ': 'Ć', 'ћ': 'ć', 'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'C', 'ц': 'c',
    'Ч': 'Č', 'ч': 'č', 'Џ': 'Dž', 'џ': 'dž', 'Ш': 'Š', 'ш': 'š'
  };

  return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
}

/**
 * Extract neighborhood/district name from location info
 * Priority: Most specific (neighbourhood) to least specific (avoid municipality)
 */
export function getNeighborhood(locationInfo: LocationInfo): string | null {
  console.log('📍 Extracting neighborhood from:', locationInfo);
  
  // Try to get the most specific local area name, avoiding broad administrative divisions
  const neighborhood = (
    locationInfo.neighbourhood ||    // Local neighborhood (best option)
    locationInfo.residential ||      // Residential area name
    locationInfo.quarter ||          // Quarter/area
    locationInfo.suburb ||           // Suburb
    locationInfo.borough ||          // Borough
    locationInfo.commercial ||       // Commercial area
    locationInfo.industrial ||       // Industrial area
    null
  );

  console.log('🔍 Found neighborhood candidate:', neighborhood);

  // Avoid returning municipality names (too broad)
  // If we got "Mediana" or other municipality, try city_district instead
  if (neighborhood && (
    neighborhood.toLowerCase() === 'mediana' ||
    neighborhood.toLowerCase() === 'medijana' ||
    neighborhood.toLowerCase() === 'palilula' ||
    neighborhood.toLowerCase() === 'crveni krst' ||
    neighborhood.toLowerCase() === 'pantelej' ||
    neighborhood.toLowerCase() === 'niška banja'
  )) {
    // These are municipalities, try to get more specific data
    const alternative = locationInfo.city_district || locationInfo.road || null;
    console.log('⚠️ Avoiding municipality, using alternative:', alternative);
    return alternative ? cyrillicToLatin(alternative) : null;
  }

  // Convert to Latin if Cyrillic
  const result = neighborhood ? cyrillicToLatin(neighborhood) : null;
  console.log('✅ Final neighborhood result:', result);
  return result;
}

/**
 * Get neighborhood with fallback strategy:
 * 1. Check cache first
 * 2. Use Nominatim reverse geocoding (Overpass API disabled due to DDoS concerns)
 */
export async function getNeighborhoodFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    console.log('Getting neighborhood for coordinates:', lat, lon);
    
    // Check cache first
    const cached = getCached(lat, lon);
    if (cached !== null) {
      return cached;
    }

    // Overpass API is disabled - use Nominatim only
    // const overpassResult = await getPreciseNeighborhood(lat, lon); // DISABLED

    // Use Nominatim
    console.log('🗺️ Using Nominatim API for neighborhood lookup');
    const nominatimResult = await reverseGeocode(lat, lon);
    console.log('Nominatim full result:', nominatimResult);
    
    if (nominatimResult?.address) {
      const neighborhood = getNeighborhood(nominatimResult.address);
      console.log('✅ Using Nominatim result:', neighborhood);

      // Cache the result
      setCache(lat, lon, neighborhood);

      return neighborhood;
    }

    console.log('❌ No neighborhood found');
    setCache(lat, lon, null);
    return null;
  } catch (error) {
    console.error('❌ Error getting neighborhood:', error);
    return null;
  }
}
