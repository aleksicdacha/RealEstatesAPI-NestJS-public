import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity/property.entity';
import { PropertyImage } from './entities/property-image.entity/property-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage])],
  providers: [PropertyService],
  controllers: [PropertyController],
  exports: [PropertyService],
})
export class PropertyModule {}
