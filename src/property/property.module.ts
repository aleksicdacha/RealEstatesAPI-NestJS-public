import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { PropertyImage } from '../property-image/property-image.entity';
import { UploadModule } from '../upload/upload.module';
import { PropertyRepository } from '@src/property/property.repository';
import { PropertyImageRepository } from '@src/property-image/property-image.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage]), UploadModule],
  providers: [PropertyService, PropertyRepository, PropertyImageRepository],
  controllers: [PropertyController],
  exports: [PropertyService, PropertyRepository, PropertyImageRepository],
})
export class PropertyModule {}
