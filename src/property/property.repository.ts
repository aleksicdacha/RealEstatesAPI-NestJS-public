import { EntityRepository, Repository } from 'typeorm';
import { Property } from '../property/entities/property.entity/property.entity';

@EntityRepository(Property)
export class PropertyRepository extends Repository<Property> {}
