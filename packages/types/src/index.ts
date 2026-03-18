// ============================================================
// Enums — values MUST match apps/api/src/entities/*/enums/*.ts
// This is the single source of truth for all frontend apps.
// ============================================================

export enum PropertyType {
  Apartment = 'apartment',
  House = 'house',
  ApartmentInHouse = 'apartment-in-house',
  Office = 'office',
  CommercialSpace = 'commercial-space',
  Land = 'land',
  VacationHome = 'vacation-home',
  Duplex = 'duplex',
}

export enum PropertyStatus {
  Active = 'active',
  Inactive = 'inactive',
  Deleted = 'deleted',
}

export enum HeatingType {
  Central = 'central',
  GasCentral = 'gas-central',
  SolidFuelCentral = 'solid-fuel-central',
  ElectricCentral = 'electric-central',
  Floor = 'floor',
  IndependentOnGas = 'independent-on-gas',
  IndependentOnSolidFuel = 'independent-on-solid-fuel',
  IndependentOnElectricity = 'independent-on-electricity',
  Fireplace = 'fireplace',
  AirConditioner = 'air-conditioner',
  Other = 'other',
}

export enum Orientation {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
  NorthEast = 'northeast',
  NorthWest = 'northwest',
  SouthEast = 'southeast',
  SouthWest = 'southwest',
}

export enum TransactionType {
  Seller = 'seller',
  Buyer = 'buyer',
  Rents = 'rents',
  RentsOut = 'rents-out',
}

export enum ClientStatus {
  Active = 'active',
  Inactive = 'inactive',
  Deleted = 'deleted',
}

export enum PaymentType {
  Cash = 'cash',
  Credit = 'credit',
  Combined = 'combined',
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

// ============================================================
// Interfaces — match actual API response shapes
// ============================================================

export interface PropertyImage {
  id: string;
  url: string;
  order: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  ownerName: string;
  ownerJmbg?: string;
  ownerIdCardNumber?: string;
  clientTransactionType: TransactionType;
  status: ClientStatus;
  paymentType?: PaymentType;
  createdAt?: string;
  updatedAt?: string;
}

/** Full property — admin API only */
export interface Property {
  guid: string;
  code: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  salePrice?: number;
  area: number;
  description?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  lat: number;
  lon: number;
  floor?: number;
  roomStructure?: string;
  heating?: HeatingType;
  orientation?: Orientation;
  bathrooms?: number;
  elevator?: boolean;
  additionalEquipment?: string[];
  constructionYear?: number;
  specialOffer?: number;
  youtubeUrl?: string;
  comment?: string;
  contractNumber?: string;
  cadastralParcel?: string;
  cadastralMunicipality?: string;
  images: PropertyImage[];
  client?: Client;
  createdAt?: string;
  updatedAt?: string;
}

/** Sanitized public property — user-web only (no sensitive fields) */
export interface PublicProperty {
  guid: string;
  code: string;
  propertyType: PropertyType;
  price: number;
  area?: number;
  description?: string;
  neighborhood?: string;
  lat: number;
  lon: number;
  floor?: number;
  roomStructure?: string;
  heating?: HeatingType;
  orientation?: Orientation;
  bathrooms?: number;
  elevator?: boolean;
  additionalEquipment?: string[];
  constructionYear?: number;
  specialOffer?: number;
  youtubeUrl?: string;
  images?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    displayOrder: number;
  }>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface PropertyFilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  searchField?: string;
  searchValue?: string;
  status?: string;
  propertyType?: string;
  clientTransactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  neighborhoods?: string;
  roomStructure?: string;
  floors?: string;
  heating?: string;
  features?: string;
  elevator?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyGuid?: string;
}
