import { HeatingType } from '@src/entities/property/enums/heating.enum';
import { PropertyType } from '@src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';
export declare class CreatePropertyDto {
    id: string;
    code: string;
    description?: string;
    additionalEquipment?: string[];
    propertyType: PropertyType;
    status: PropertyStatus;
    price: number;
    salePrice?: number;
    area?: number;
    lat?: number;
    lon?: number;
    comment?: string;
    elevator?: boolean;
    address: string;
    neighborhood?: string;
    constructionYear?: number;
    bathrooms?: number;
    floor?: number;
    roomStructure?: string;
    heating?: HeatingType;
    images?: string[];
}
