import { EntityRepository, Repository } from 'typeorm';
import { PropertyImage } from '../property/entities/property-image.entity/property-image.entity';

@EntityRepository(PropertyImage)
export class PropertyImageRepository extends Repository<PropertyImage> {}
