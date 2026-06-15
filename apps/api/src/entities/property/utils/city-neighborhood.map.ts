/**
 * City → Neighborhood mapping for the Real Estate platform.
 *
 * Defines which neighborhoods belong to which city. This is the single source
 * of truth for city filtering and the cities returned by getFilterOptions().
 *
 * To add a new city:
 *   1. Add a new key with an array of neighborhood substrings
 *   2. Properties whose neighborhood matches will be assigned to that city
 *   3. The city will appear in the filter dropdown automatically
 */

export interface CityMapping {
  /** Display name shown in filter dropdowns */
  label: string;
  /**
   * Neighborhood substrings (case-insensitive ILIKE match).
   * A property belongs to this city if its neighborhood contains any of these.
   */
  neighborhoods: string[];
}

/**
 * Ordered mapping of cities to their neighborhoods.
 * Order determines priority: first matching city wins.
 * Properties not matching any city are treated as "Other".
 */
export const CITY_MAP: Record<string, CityMapping> = {
  Niš: {
    label: 'Niš',
    neighborhoods: [
      // Niš covers all neighborhoods by default — empty array means
      // "match everything". This is the agency's primary market.
    ],
  },
  Beograd: {
    label: 'Beograd',
    neighborhoods: [
      // TODO: Add Belgrade neighborhoods when properties become available
      // Examples: 'Vračar', 'Novi Beograd', 'Zemun', 'Palilula', 'Čukarica',
      //           'Zvezdara', 'Voždovac', 'Savski venac', 'Stari grad'
    ],
  },
};

/**
 * Default city key used when a property's neighborhood doesn't match any known city.
 * Set to the primary city (usually where the agency is based).
 */
export const DEFAULT_CITY = 'Niš';

/**
 * Resolve which city a neighborhood belongs to.
 * Returns the city key (e.g. "Niš") or DEFAULT_CITY if no match.
 */
export function resolveCity(neighborhood: string | null | undefined): string {
  if (!neighborhood?.trim()) return DEFAULT_CITY;

  const normalized = neighborhood.trim();

  for (const [cityKey, mapping] of Object.entries(CITY_MAP)) {
    // If neighborhoods list is empty, this city matches everything
    if (mapping.neighborhoods.length === 0) return cityKey;

    for (const pattern of mapping.neighborhoods) {
      if (normalized.toLowerCase().includes(pattern.toLowerCase())) {
        return cityKey;
      }
    }
  }

  return DEFAULT_CITY;
}

/**
 * Get list of available city keys for filter dropdowns.
 */
export function getCityKeys(): string[] {
  return Object.keys(CITY_MAP);
}

/**
 * Get neighborhoods belonging to a specific city.
 */
export function getCityNeighborhoods(cityKey: string): string[] {
  return CITY_MAP[cityKey]?.neighborhoods ?? [];
}
