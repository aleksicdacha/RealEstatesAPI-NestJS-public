import { PropertyImageService } from './property-image.service';
import { CreatePropertyImageDto } from './dto/create-propertyImage.dto';
import { UpdatePropertyImageDto } from './dto/update-propertyImage.dto';
export declare class PropertyImageController {
    private readonly propertyImageService;
    constructor(propertyImageService: PropertyImageService);
    create(createImageDto: CreatePropertyImageDto): Promise<import("./property-image.entity").PropertyImage>;
    findAllByProperty(propertyId: string): Promise<import("./property-image.entity").PropertyImage[]>;
    updateOrder(propertyId: string, orderData: {
        id: string;
        order: number;
    }[]): Promise<import("./property-image.entity").PropertyImage[]>;
    update(id: string, updateImageDto: UpdatePropertyImageDto): Promise<import("./property-image.entity").PropertyImage>;
    delete(id: string): Promise<void>;
}
