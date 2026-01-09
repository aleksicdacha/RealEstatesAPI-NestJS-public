import { Property, PaginatedResponse } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

/**
 * Fetch featured properties (special offers)
 * These are properties with specialOffer field set (1-20), sorted by specialOffer ASC
 * Lower specialOffer number = higher priority on homepage
 */
export async function fetchFeaturedProperties(limit: number = 10): Promise<Property[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('page', '1');
    
    const url = `${API_BASE_URL}/properties/public?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch featured properties:', response.statusText);
      return [];
    }

    const data: PaginatedResponse<Property> = await response.json();
    
    // Filter only properties with specialOffer field and images
    const featured = data.items.filter(
      p => p.specialOffer !== undefined && 
           p.specialOffer !== null && 
           p.images && 
           p.images.length > 0
    );
    
    // Sort by specialOffer (ascending - lower number = higher priority)
    featured.sort((a, b) => (a.specialOffer || 999) - (b.specialOffer || 999));
    
    return featured.slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}
