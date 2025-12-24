import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { HeatingType } from '../enums/heating.enum';

/**
 * DTO for public-facing property data (user-web frontend)
 * Excludes sensitive information like salePrice, comments, client info, etc.
 */
export class PublicPropertyDto {
  id: string;
  code: string;
  description: string;
  propertyType: PropertyType;
  price: number; // Public listing price only
  area?: number;
  neighborhood?: string;
  lat: number;
  lon: number;
  elevator: boolean;
  additionalEquipment: string[];
  constructionYear?: number;
  bathrooms?: number;
  floor?: number;
  roomStructure?: string;
  heating?: HeatingType;
  images?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    displayOrder: number;
  }>;

  // Explicitly excluded fields (for documentation):
  // - address: Exact address hidden, only neighborhood shown
  // - status: Only active properties shown on public side
  // - salePrice: Internal agency price
  // - comment: Internal notes
  // - client: Owner information
  // - createdAt, updatedAt: Internal metadata
}
