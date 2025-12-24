import { UpdatePropertyImageDto } from '@src/entities/property-image/dto/update-propertyImage.dto';
import { HeatingType } from '@src/entities/property/enums/heating.enum';
import { PropertyType } from '@src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';
export declare class UpdatePropertyDTO {
    code?: string;
    name?: string;
    description?: string;
    propertyType?: PropertyType;
    status?: PropertyStatus;
    price?: number;
    salePrice?: number;
    area?: number;
    lat?: number;
    lon?: number;
    comment?: string;
    additionalEquipment?: string[];
    elevator?: boolean;
    address?: string;
    neighborhood?: string;
    constructionYear?: number;
    bathrooms?: number;
    floor?: number;
    roomStructure?: string;
    heating?: HeatingType;
    images?: UpdatePropertyImageDto[];
}
