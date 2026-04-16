/**
 * Shared property type translations
 * Prevents duplication across components
 */
export const PROPERTY_TYPE_MAP: { [key: string]: string } = {
  'apartment': 'apartment',
  'house': 'house',
  'apartment-in-house': 'apartmentInHouse',
  'office': 'office',
  'commercial-space': 'commercial',
  'land': 'land',
  'vacation-home': 'vacationHome',
  'duplex': 'duplex',
};

export const HEATING_TYPE_MAP: { [key: string]: string } = {
  'central': 'centralHeating',
  'gas-central': 'gasHeating',
  'electric-central': 'electricHeating',
  'solid-fuel-central': 'solidFuel',
  'floor': 'floorHeating',
  'independent-on-gas': 'independentGas',
  'independent-on-solid-fuel': 'independentSolidFuel',
  'independent-on-electricity': 'independentElectricity',
  'fireplace': 'fireplace',
  'air-conditioner': 'airConditioner',
  'other': 'otherHeating',
};

export const ROOM_STRUCTURE_MAP: { [key: string]: string } = {
  garsonjera: 'studio',
  jednosoban: 'oneRoom',
  jednoiposoban: 'oneHalfRoom',
  dvosoban: 'twoRoom',
  dvoiposoban: 'twoHalfRoom',
  trosoban: 'threeRoom',
  troiposoban: 'threeHalfRoom',
  četvorosoban: 'fourRoom',
  cetvorosoban: 'fourRoom',
  četvoroiposoban: 'fourHalfRoom',
  cetvoroiposoban: 'fourHalfRoom',
  'petosoban i veci': 'fivePlusRoom',
  'petosoban i veći': 'fivePlusRoom',
  'petosoban i većи': 'fivePlusRoom', // Cyrillic variant
  petosoban: 'fiveRoom',
};

/**
 * Property translation utilities
 */
export class PropertyTranslator {
  /**
   * Translates property type to translation key
   * Returns original value if no mapping found
   */
  static getPropertyTypeKey(type: string): string {
    return PROPERTY_TYPE_MAP[type] || type.toLowerCase();
  }

  /**
   * Translates heating type to translation key
   */
  static getHeatingTypeKey(heating: string): string {
    return HEATING_TYPE_MAP[heating] || heating.toLowerCase();
  }

  /**
   * Translates room structure to translation key
   * Normalizes input to handle variations (spaces, case, special chars)
   */
  static getRoomStructureKey(roomStructure: string): string {
    // Normalize: trim, lowercase, normalize whitespace
    const normalized = roomStructure
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // Normalize multiple spaces to single space

    // Return mapped key if found, otherwise return normalized string
    // PropertyCard's safeTranslate will handle fallback to original value
    return ROOM_STRUCTURE_MAP[normalized] || normalized;
  }

  /**
   * Warns about missing translation (development helper)
   */
  static warnMissingTranslation(type: string, value: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[PropertyTranslator] Missing translation for ${type}: ${value}`);
    }
  }
}
