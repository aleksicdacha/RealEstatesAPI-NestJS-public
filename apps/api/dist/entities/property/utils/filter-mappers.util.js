"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStructureMapper = exports.NeighborhoodMapper = exports.FloorFilterMapper = exports.FLOOR_SPECIAL_VALUES = exports.BEOGRAD_NEIGHBORHOODS = exports.ROOM_STRUCTURE_MAP = exports.NEIGHBORHOOD_MAP = void 0;
exports.NEIGHBORHOOD_MAP = {
    'medijana': 'Medijana',
    'palilula': 'Palilula',
    'pantelej': 'Pantelej',
    'crveni-krst': 'Crveni Krst',
    'niska-banja': 'Niška Banja',
    'bubanj': 'Bubanj',
    'duvaniste': 'Duvanjište',
    'cair': 'Čair',
    'bulevar': 'Bulevar',
    'vrezina': 'Vrežina',
    'durlan': 'Durlan',
    'beverly-hills': 'Beverly Hills',
    'jagodin-mala': 'Jagodin mala',
    'marger': 'Marger',
    'brzi-brod': 'Brzi Brod',
    'centar': 'Centar',
    'klinicki-centar': 'Klinički centar',
    'calije': 'Čalije',
    'pantelijmon': 'Pantelijmon',
    'vidriste': 'Vidrište',
    'pevac': 'Pevac',
    'cele-kula': 'Čele kula',
};
exports.ROOM_STRUCTURE_MAP = {
    'garsonjera': ['garsonjera', '0.5', '0,5'],
    '1': ['jednosoban', '1'],
    '1.5': ['jednoiposoban', '1.5', '1,5'],
    '2': ['dvosoban', '2'],
    '2.5': ['dvoiposoban', '2.5', '2,5'],
    '3': ['trosoban', '3'],
    '3.5': ['troiposoban', '3.5', '3,5'],
    '4': ['cetvorosoban', 'četvorosoban', 'cetvoroiposoban', '4', '4.5', '4,5'],
    '5': ['petosoban', '5'],
};
exports.BEOGRAD_NEIGHBORHOODS = ['Beograd mala', 'Beverli Hils', 'MZ Dedinje'];
exports.FLOOR_SPECIAL_VALUES = {
    BASEMENT: -1,
    GROUND_FLOOR: 0,
    ATTIC_MIN: 10,
};
class FloorFilterMapper {
    static mapFloorToCondition(floorValue) {
        const floorStr = String(floorValue).trim();
        if (floorStr === 'SU' || floorStr.toLowerCase() === 'suteren') {
            return `property.floor = ${exports.FLOOR_SPECIAL_VALUES.BASEMENT}`;
        }
        if (floorStr === 'VPR' || floorStr.toLowerCase() === 'visoko prizemlje') {
            return `property.floor = ${exports.FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`;
        }
        if (floorStr === 'PR' || floorStr.toLowerCase() === 'prizemlje') {
            return `property.floor = ${exports.FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`;
        }
        if (floorStr === 'PTK' || floorStr.toLowerCase() === 'potkrovlje') {
            return `property.floor >= ${exports.FLOOR_SPECIAL_VALUES.ATTIC_MIN}`;
        }
        if (floorStr === '2-4') {
            return `(property.floor >= 2 AND property.floor <= 4)`;
        }
        if (floorStr === '5-10') {
            return `(property.floor >= 5 AND property.floor <= 10)`;
        }
        if (floorStr === '11+') {
            return `property.floor >= 11`;
        }
        const floorNum = parseInt(floorStr);
        if (!isNaN(floorNum)) {
            return `property.floor = ${floorNum}`;
        }
        return null;
    }
    static mapFloors(floors) {
        return floors
            .map(floor => this.mapFloorToCondition(floor))
            .filter((condition) => condition !== null);
    }
}
exports.FloorFilterMapper = FloorFilterMapper;
class NeighborhoodMapper {
    static map(neighborhoodKey) {
        return exports.NEIGHBORHOOD_MAP[neighborhoodKey.toLowerCase()] || neighborhoodKey;
    }
    static mapBatch(neighborhoods) {
        return neighborhoods.map(n => this.map(n));
    }
}
exports.NeighborhoodMapper = NeighborhoodMapper;
class RoomStructureMapper {
    static map(roomStructure) {
        return exports.ROOM_STRUCTURE_MAP[roomStructure] || [roomStructure];
    }
    static mapBatch(roomStructures) {
        const mapped = [];
        roomStructures.forEach(rs => {
            mapped.push(...this.map(rs));
        });
        return [...new Set(mapped)];
    }
}
exports.RoomStructureMapper = RoomStructureMapper;
//# sourceMappingURL=filter-mappers.util.js.map