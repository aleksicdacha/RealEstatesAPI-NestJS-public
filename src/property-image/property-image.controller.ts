import { Controller, Post, Body, Param, Get, Patch, Delete } from '@nestjs/common';
import { PropertyImageService } from './property-image.service';
import { CreatePropertyImageDto } from '../property/dto/create-propertyImage.dto';
import { UpdatePropertyImageDto } from '../property/dto/update-propertyImage.dto';

@Controller('properties/:propertyId/images')
export class PropertyImageController {
  constructor(private readonly propertyImageService: PropertyImageService) {}

  @Post()
  create(
    // @Param('propertyId') propertyId?: string,
    @Body() createImageDto: CreatePropertyImageDto,
  ) {
    return this.propertyImageService.create(createImageDto);
  }

  @Get()
  findAllByProperty(@Param('propertyId') propertyId: string) {
    return this.propertyImageService.findAllByProperty(propertyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdatePropertyImageDto,
  ) {
    return this.propertyImageService.update(id, updateImageDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.propertyImageService.delete(id);
  }
}
