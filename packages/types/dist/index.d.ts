export declare enum PropertyType {
    APARTMENT = "APARTMENT",
    HOUSE = "HOUSE",
    LAND = "LAND",
    OFFICE = "OFFICE",
    COMMERCIAL = "COMMERCIAL",
    GARAGE = "GARAGE",
    STUDIO = "STUDIO",
    PENTHOUSE = "PENTHOUSE",
    VILLA = "VILLA",
    COTTAGE = "COTTAGE"
}
export declare enum PropertyStatus {
    AVAILABLE = "AVAILABLE",
    RESERVED = "RESERVED",
    SOLD = "SOLD",
    RENTED = "RENTED"
}
export declare enum TransactionType {
    SALE = "SALE",
    RENT = "RENT"
}
export declare enum HeatingType {
    CENTRAL = "CENTRAL",
    GAS = "GAS",
    ELECTRIC = "ELECTRIC",
    DISTRICT = "DISTRICT",
    WOOD = "WOOD",
    HEAT_PUMP = "HEAT_PUMP",
    OTHER = "OTHER"
}
export interface Property {
    id: number;
    code: string;
    title: string;
    description: string;
    type: PropertyType;
    transactionType: TransactionType;
    status: PropertyStatus;
    price: number;
    area: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    hasElevator: boolean;
    hasParking: boolean;
    hasGarage: boolean;
    hasBalcony: boolean;
    hasTerrace: boolean;
    hasGarden: boolean;
    hasBasement: boolean;
    yearBuilt: number;
    heatingType: HeatingType;
    address: string;
    city: string;
    neighborhood: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    images: PropertyImage[];
    featuredImage?: string;
    createdAt: string;
    updatedAt: string;
}
export interface PropertyImage {
    id: number;
    url: string;
    thumbnailUrl: string;
    alt: string;
    order: number;
    width: number;
    height: number;
}
export interface PropertySearchParams {
    search?: string;
    type?: PropertyType[];
    transactionType?: TransactionType;
    status?: PropertyStatus[];
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    rooms?: number[];
    bedrooms?: number[];
    city?: string;
    neighborhood?: string;
    hasParking?: boolean;
    hasElevator?: boolean;
    hasGarden?: boolean;
    hasBalcony?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    AGENT = "AGENT",
    USER = "USER"
}
export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface AuthResponse {
    access_token: string;
    user: User;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
export interface Client {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
    propertyId?: number;
    preferredContactMethod?: 'email' | 'phone';
}
export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}
export interface MapMarker {
    id: number;
    position: {
        lat: number;
        lng: number;
    };
    property: Property;
}
export interface FilterOptions {
    types: PropertyType[];
    cities: string[];
    neighborhoods: string[];
    priceRanges: PriceRange[];
    areaRanges: AreaRange[];
    roomOptions: number[];
    bedroomOptions: number[];
}
export interface PriceRange {
    label: string;
    min: number;
    max: number;
}
export interface AreaRange {
    label: string;
    min: number;
    max: number;
}
