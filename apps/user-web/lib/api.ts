const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
const API_UPLOADS_BASE = API_BASE_URL.replace(/\/v1$/, '');

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
  specialOffer?: number;
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
  clientTransactionType?: string;
  propertyType?: string;
  city?: string;
  neighborhoods?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  floors?: string;
  heating?: string;
  elevator?: boolean;
}): Promise<PaginatedResponse<Property>> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.order) queryParams.append('order', params.order);
  if (params?.roomStructure)
    queryParams.append('roomStructure', params.roomStructure);
  if (params?.clientTransactionType)
    queryParams.append('clientTransactionType', params.clientTransactionType);
  if (params?.propertyType)
    queryParams.append('propertyType', params.propertyType);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.neighborhoods)
    queryParams.append('neighborhoods', params.neighborhoods);
  if (params?.minPrice !== undefined)
    queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined)
    queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.minArea !== undefined)
    queryParams.append('minArea', params.minArea.toString());
  if (params?.maxArea !== undefined)
    queryParams.append('maxArea', params.maxArea.toString());
  if (params?.floors) queryParams.append('floors', params.floors);
  if (params?.heating) queryParams.append('heating', params.heating);
  if (params?.elevator !== undefined)
    queryParams.append('elevator', params.elevator.toString());

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

export async function fetchPublicFilterOptions(): Promise<{
  cities: string[];
  neighborhoods: string[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/filters/options`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return { cities: [], neighborhoods: [] };
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { cities: [], neighborhoods: [] };
  }
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

export async function fetchSimilarProperties(id: string): Promise<Property[]> {
  const response = await fetch(
    `${API_BASE_URL}/properties/public/${id}/similar`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch similar properties: ${response.statusText}`,
    );
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
    return `${API_UPLOADS_BASE}${imageUrl}`;
  }

  // If URL starts with /assets/, prepend the API URL
  if (imageUrl.startsWith('/assets/')) {
    return `${API_UPLOADS_BASE}${imageUrl}`;
  }

  // Otherwise, add /uploads/properties/ prefix
  return `${API_UPLOADS_BASE}/uploads/properties/${imageUrl}`;
}

export function getFavoriteImage(
  images: PropertyImage[],
): PropertyImage | undefined {
  return images.find((img) => img.isFavorite) || images[0];
}
