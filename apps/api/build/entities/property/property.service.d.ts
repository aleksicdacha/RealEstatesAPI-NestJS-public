import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatsQueryDto, PropertyStatsDto } from './dto/property-stats.dto';
import { PublicPropertyDto } from './dto/public-property.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { DataSource } from 'typeorm';
import { PropertyRepository } from '@src/entities/property/property.repository';
import { PropertyImageRepository } from '@src/entities/property-image/property-image.repository';
export declare class PropertyService {
    private readonly propertyRepository;
    private readonly propertyImageRepository;
    private readonly dataSource;
    constructor(propertyRepository: PropertyRepository, propertyImageRepository: PropertyImageRepository, dataSource: DataSource);
    private reorganizeSpecialOffers;
    create(createPropertyDto: CreatePropertyDto): Promise<Property>;
    update(id: string, updatePropertyDto: UpdatePropertyDTO): Promise<Property>;
    findAll(options: FilterPropertyDto): Promise<Pagination<Property>>;
    findAllPublic(options: FilterPropertyDto): Promise<Pagination<PublicPropertyDto>>;
    private transformToPublicDto;
    findOne(id: string): Promise<Property>;
    findOnePublic(id: string): Promise<PublicPropertyDto>;
    remove(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;
    getAveragePriceByType(query: PropertyStatsQueryDto): Promise<PropertyStatsDto[]>;
    getFilterOptions(): Promise<{
        cities: string[];
        neighborhoods: string[];
    }>;
}
