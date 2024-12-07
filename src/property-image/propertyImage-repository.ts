import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PropertyImage } from '@src/property-image/property-image.entity';


@Injectable()
export class PropertyImageRepository extends Repository<PropertyImage> {}
