import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { PropertyImage } from '../property-image/property-image.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage]), UploadModule],
  providers: [PropertyService],
  controllers: [PropertyController],
  exports: [PropertyService],
})
export class PropertyModule {}
