import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Property } from '@src/property/property.entity';

@Injectable()
export class PropertyRepository extends Repository<Property> {}

