export declare const NEIGHBORHOOD_MAP: {
    [key: string]: string;
};
export declare const ROOM_STRUCTURE_MAP: {
    [key: string]: string[];
};
export declare const BEOGRAD_NEIGHBORHOODS: string[];
export declare const FLOOR_SPECIAL_VALUES: {
    readonly BASEMENT: -1;
    readonly GROUND_FLOOR: 0;
    readonly ATTIC_MIN: 10;
};
export declare class FloorFilterMapper {
    static mapFloorToCondition(floorValue: string): string | null;
    static mapFloors(floors: string[]): string[];
}
export declare class NeighborhoodMapper {
    static map(neighborhoodKey: string): string;
    static mapBatch(neighborhoods: string[]): string[];
}
export declare class RoomStructureMapper {
    static map(roomStructure: string): string[];
    static mapBatch(roomStructures: string[]): string[];
}
