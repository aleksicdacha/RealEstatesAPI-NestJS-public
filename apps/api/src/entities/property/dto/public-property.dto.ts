import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { HeatingType } from '../enums/heating.enum';
import { Orientation } from '../enums/orientation.enum';

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
  orientation?: Orientation; // Public-facing field
  youtubeUrl?: string; // Public-facing field for video embed
  specialOffer?: number; // For homepage ordering
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
  // - contractNumber: Internal contract data
  // - cadastralParcel (KP): Internal cadastral data
  // - cadastralMunicipality (KO): Internal cadastral data
}
