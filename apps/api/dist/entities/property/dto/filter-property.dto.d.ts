export declare class FilterPropertyDto {
    clientTransactionType?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
    searchField?: string;
    searchValue?: string;
    status?: string;
    propertyType?: string;
    role?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    minLatitude?: number;
    maxLatitude?: number;
    minLongitude?: number;
    maxLongitude?: number;
    elevator?: boolean;
    city?: string;
    neighborhoods?: string[];
    bathrooms?: number[];
    floors?: string[];
    roomStructure?: string[];
    heating?: string[];
    features?: string[];
}
