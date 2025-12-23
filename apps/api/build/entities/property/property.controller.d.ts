import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatsQueryDto } from './dto/property-stats.dto';
export declare class PropertyController {
    private readonly propertyService;
    constructor(propertyService: PropertyService);
    create(createPropertyDto: CreatePropertyDto, files: Express.Multer.File[]): Promise<import("./property.entity").Property>;
    getAveragePriceByType(query: PropertyStatsQueryDto): Promise<import("./dto/property-stats.dto").PropertyStatsDto[]>;
    getFilterOptions(): Promise<{
        cities: string[];
        neighborhoods: string[];
    }>;
    findAll(query: FilterPropertyDto): Promise<import("nestjs-typeorm-paginate").Pagination<import("./property.entity").Property, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(guid: string): Promise<import("./property.entity").Property>;
    update(guid: string, updatePropertyDto: UpdatePropertyDTO): Promise<import("./property.entity").Property>;
    remove(guid: string): Promise<void>;
}
