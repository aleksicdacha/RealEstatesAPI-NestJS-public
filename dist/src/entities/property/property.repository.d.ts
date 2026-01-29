import { DataSource, Repository } from 'typeorm';
import { Property } from './property.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
export declare class PropertyRepository extends Repository<Property> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findFilteredProperties(options: FilterPropertyDto): Promise<[Property[], number]>;
    softDeleteProperty(id: string): Promise<void>;
}
