import { PropertyType } from '../enums/property-type.enum';
import { HeatingType } from '../enums/heating.enum';
import { Orientation } from '../enums/orientation.enum';
export declare class PublicPropertyDto {
    id: string;
    code: string;
    description: string;
    propertyType: PropertyType;
    price: number;
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
    orientation?: Orientation;
    youtubeUrl?: string;
    specialOffer?: number;
    images?: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
        displayOrder: number;
    }>;
}
