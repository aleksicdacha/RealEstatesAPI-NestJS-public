const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export interface PropertyImage {
  id: string;
  url: string;
  order: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  code: string;
  propertyType: string;
  price: number;
  area: number;
  description?: string;
  lat: number;
  lon: number;
  floor?: number;
  roomStructure?: string;
  heating?: string;
  bathrooms?: number;
  neighborhood?: string;
  elevator?: boolean;
  additionalEquipment?: string[];
  constructionYear?: number;
  images: PropertyImage[];
  // Explicitly excluded from public API:
  // - address (exact address hidden, only neighborhood shown)
  // - status (only active properties shown)
  // - salePrice (internal agency price)
  // - comment (internal notes)
  // - client (owner information)
  // - createdAt, updatedAt (internal metadata)
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

export async function fetchProperties(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  roomStructure?: string;
}): Promise<PaginatedResponse<Property>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.order) queryParams.append('order', params.order);
  if (params?.roomStructure) queryParams.append('roomStructure', params.roomStructure);

  // Use public endpoint for user-web to get sanitized data
  // Public API automatically returns only ACTIVE properties
  const url = `${API_BASE_URL}/properties/public?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchProperty(id: string): Promise<Property> {
  // Use public endpoint for user-web to get sanitized data
  const response = await fetch(`${API_BASE_URL}/properties/public/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.statusText}`);
  }

  return response.json();
}

export function getImageUrl(imageUrl: string): string {
  // If URL already starts with http, return as-is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If URL starts with /uploads/, prepend the API URL
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:3000${imageUrl}`;
  }
  
  // Otherwise, add /uploads/ prefix
  return `http://localhost:3000/uploads/${imageUrl}`;
}

export function getFavoriteImage(images: PropertyImage[]): PropertyImage | undefined {
  return images.find(img => img.isFavorite) || images[0];
}
