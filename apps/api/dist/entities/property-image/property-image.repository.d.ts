import { DataSource, Repository } from 'typeorm';
import { PropertyImage } from '@src/entities/property-image/property-image.entity';
export declare class PropertyImageRepository extends Repository<PropertyImage> {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    deleteImagesByPropertyId(propertyId: string): Promise<void>;
    isImageUsedByOtherProperties(url: string, propertyId: string): Promise<boolean>;
    handlePropertyImagesParallel(manager: any, propertyId: string, images: PropertyImage[]): Promise<void>;
    deleteImageFile(filePath: string): Promise<void>;
}
