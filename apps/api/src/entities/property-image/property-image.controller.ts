import { Controller, Post, Body, Param, Get, Patch, Delete, ValidationPipe, UsePipes } from '@nestjs/common';
import { PropertyImageService } from './property-image.service';
import { CreatePropertyImageDto } from './dto/create-propertyImage.dto';
import { UpdatePropertyImageDto } from './dto/update-propertyImage.dto';
import { ReorderPropertyImageDto } from './dto/reorder-propertyImage.dto';

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

  @Patch('reorder')
  @UsePipes(new ValidationPipe({ transform: false, whitelist: false }))
  updateOrder(
    @Param('propertyId') propertyId: string,
    @Body() orderData: { id: string; order: number }[],
  ) {
    return this.propertyImageService.updateImageOrder(propertyId, orderData);
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
