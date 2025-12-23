import { Repository } from 'typeorm';
import { PropertyImage } from './property-image.entity';
import { CreatePropertyImageDto } from './dto/create-propertyImage.dto';
import { UpdatePropertyImageDto } from './dto/update-propertyImage.dto';
export declare class PropertyImageService {
    private readonly propertyImageRepository;
    constructor(propertyImageRepository: Repository<PropertyImage>);
    create(data: CreatePropertyImageDto): Promise<PropertyImage>;
    findAllByProperty(propertyId: string): Promise<PropertyImage[]>;
    update(id: string, updateImageDto: UpdatePropertyImageDto): Promise<PropertyImage>;
    delete(id: string): Promise<void>;
    updateImageOrder(propertyId: string, imageOrderData: {
        id: string;
        order: number;
    }[]): Promise<PropertyImage[]>;
}
