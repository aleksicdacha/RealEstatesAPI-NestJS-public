import { Property } from '@src/entities/property/property.entity';
export declare class PropertyImage {
    id: string;
    url: string;
    order: number;
    isFavorite: boolean;
    property: Property;
    createdAt: Date;
    updatedAt: Date;
}
