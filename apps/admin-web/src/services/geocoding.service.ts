import axios from 'axios';

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
 */
export async function getPreciseNeighborhood(lat: number, lon: number): Promise<string | null> {
  try {
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
      return name ? cyrillicToLatin(name) : null;
    }

    return null;
  } catch (error) {
    // Don't log error for timeout - it's expected sometimes
    if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
      console.log('Overpass API timeout, falling back to Nominatim');
    } else {
      console.error('Error in Overpass API query:', error);
    }
    return null;
  }
}

/**
 * Get location details from coordinates using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
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
        'User-Agent': 'RealEstateApp/1.0', // Required by Nominatim
      },
    });

    // Log the full response to see what data we're getting
    console.log('Nominatim response for coordinates:', lat, lon);
    console.log('Address details:', response.data.address);

    return response.data;
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
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${address}, ${city}, Serbia`,
        format: 'json',
        addressdetails: 1,
        limit: 1,
        'accept-language': 'sr-Latn,en', // Prefer Latin Serbian, fallback to English
      },
      headers: {
        'User-Agent': 'RealEstateApp/1.0',
      },
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
    }

    return null;
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
 * 1. Try Overpass API (most precise) with timeout
 * 2. Fall back to Nominatim reverse geocoding
 */
export async function getNeighborhoodFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    console.log('Getting neighborhood for coordinates:', lat, lon);
    
    // Try Overpass API first, but don't wait too long
    const overpassPromise = getPreciseNeighborhood(lat, lon);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
    
    const overpassResult = await Promise.race([overpassPromise, timeoutPromise]);
    
    if (overpassResult) {
      console.log('✅ Using Overpass API result:', overpassResult);
      return overpassResult;
    }

    // Fallback to Nominatim (more reliable but less precise)
    console.log('⚠️ Overpass timeout/no result, falling back to Nominatim API');
    const nominatimResult = await reverseGeocode(lat, lon);
    console.log('Nominatim full result:', nominatimResult);
    
    if (nominatimResult?.address) {
      const neighborhood = getNeighborhood(nominatimResult.address);
      console.log('✅ Using Nominatim result:', neighborhood);
      return neighborhood;
    }

    console.log('❌ No neighborhood found');
    return null;
  } catch (error) {
    console.error('❌ Error getting neighborhood:', error);
    // Try Nominatim as last resort
    try {
      const nominatimResult = await reverseGeocode(lat, lon);
      if (nominatimResult?.address) {
        const result = getNeighborhood(nominatimResult.address);
        console.log('✅ Fallback Nominatim result:', result);
        return result;
      }
    } catch (fallbackError) {
      console.error('❌ Nominatim fallback also failed:', fallbackError);
    }
    return null;
  }
}
