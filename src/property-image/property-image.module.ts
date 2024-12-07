import { Module } from '@nestjs/common';
import { PropertyImageService } from './property-image.service';
import { PropertyImageController } from './property-image.controller';
import { PropertyImageRepository } from './propertyImage-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyImage } from './property-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyImage])],
  providers: [PropertyImageService, PropertyImageRepository],
  controllers: [PropertyImageController]
})
export class PropertyImageModule {}
