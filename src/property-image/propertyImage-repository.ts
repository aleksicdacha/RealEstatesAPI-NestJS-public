import { EntityRepository, Repository } from 'typeorm';
import { PropertyImage } from './property-image.entity';

@EntityRepository(PropertyImage)
export class PropertyImageRepository extends Repository<PropertyImage> {}
