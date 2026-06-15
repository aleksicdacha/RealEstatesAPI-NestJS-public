/**
 * Filter mapping constants for property queries
 * Centralized to prevent duplication and improve maintainability
 */

export {
  CITY_MAP,
  resolveCity,
  getCityKeys,
  getCityNeighborhoods,
} from './city-neighborhood.map';

export const NEIGHBORHOOD_MAP: { [key: string]: string } = {
  medijana: 'Medijana',
  palilula: 'Palilula',
  pantelej: 'Pantelej',
  'crveni-krst': 'Crveni Krst',
  'niska-banja': 'Niška Banja',
  bubanj: 'Bubanj',
  duvaniste: 'Duvanjište',
  cair: 'Čair',
  bulevar: 'Bulevar',
  vrezina: 'Vrežina',
  durlan: 'Durlan',
  'beverly-hills': 'Beverly Hills',
  'jagodin-mala': 'Jagodin mala',
  marger: 'Marger',
  'brzi-brod': 'Brzi Brod',
  centar: 'Centar',
  'klinicki-centar': 'Klinički centar',
  calije: 'Čalije',
  pantelijmon: 'Pantelijmon',
  vidriste: 'Vidrište',
  pevac: 'Pevac',
  'cele-kula': 'Čele kula',
};

export const ROOM_STRUCTURE_MAP: { [key: string]: string[] } = {
  garsonjera: ['garsonjera', '0.5', '0,5'],
  '1': ['jednosoban', '1'],
  '1.5': ['jednoiposoban', '1.5', '1,5'],
  '2': ['dvosoban', '2'],
  '2.5': ['dvoiposoban', '2.5', '2,5'],
  '3': ['trosoban', '3'],
  '3.5': ['troiposoban', '3.5', '3,5'],
  '4': ['cetvorosoban', 'četvorosoban', 'cetvoroiposoban', '4', '4.5', '4,5'],
  '5': ['petosoban', '5'],
};

export const FLOOR_SPECIAL_VALUES = {
  BASEMENT: -1, // SU, suteren
  GROUND_FLOOR: 0, // PR, prizemlje / VPR, visoko prizemlje
  ATTIC_MIN: 10, // PTK, potkrovlje (assumes high floor)
} as const;

/**
 * Maps floor filter value to database query condition
 */
export class FloorFilterMapper {
  static mapFloorToCondition(floorValue: string): string | null {
    const floorStr = String(floorValue).trim();

    // Handle special values
    if (floorStr === 'SU' || floorStr.toLowerCase() === 'suteren') {
      return `property.floor = ${FLOOR_SPECIAL_VALUES.BASEMENT}`;
    }

    if (floorStr === 'VPR' || floorStr.toLowerCase() === 'visoko prizemlje') {
      return `property.floor = ${FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`;
    }

    if (floorStr === 'PR' || floorStr.toLowerCase() === 'prizemlje') {
      return `property.floor = ${FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`;
    }

    if (floorStr === 'PTK' || floorStr.toLowerCase() === 'potkrovlje') {
      return `property.floor >= ${FLOOR_SPECIAL_VALUES.ATTIC_MIN}`;
    }

    // Handle ranges
    if (floorStr === '2-4') {
      return `(property.floor >= 2 AND property.floor <= 4)`;
    }

    if (floorStr === '5-10') {
      return `(property.floor >= 5 AND property.floor <= 10)`;
    }

    if (floorStr === '11+') {
      return `property.floor >= 11`;
    }

    // Try to parse as number
    const floorNum = parseInt(floorStr);
    if (!isNaN(floorNum)) {
      return `property.floor = ${floorNum}`;
    }

    return null;
  }

  static mapFloors(floors: string[]): string[] {
    return floors
      .map((floor) => this.mapFloorToCondition(floor))
      .filter((condition): condition is string => condition !== null);
  }
}

/**
 * Maps neighborhood UI values to database values
 */
export class NeighborhoodMapper {
  static map(neighborhoodKey: string): string {
    return NEIGHBORHOOD_MAP[neighborhoodKey.toLowerCase()] || neighborhoodKey;
  }

  static mapBatch(neighborhoods: string[]): string[] {
    return neighborhoods.map((n) => this.map(n));
  }
}

/**
 * Maps room structure UI values to database values
 */
export class RoomStructureMapper {
  static map(roomStructure: string): string[] {
    return ROOM_STRUCTURE_MAP[roomStructure] || [roomStructure];
  }

  static mapBatch(roomStructures: string[]): string[] {
    const mapped: string[] = [];
    roomStructures.forEach((rs) => {
      mapped.push(...this.map(rs));
    });
    return [...new Set(mapped)]; // Remove duplicates
  }
}
