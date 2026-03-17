import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyImage } from './property-image.entity';
import { CreatePropertyImageDto } from './dto/create-propertyImage.dto';
import { UpdatePropertyImageDto } from './dto/update-propertyImage.dto';

@Injectable()
export class PropertyImageService {
  constructor(
    @InjectRepository(PropertyImage)
    private readonly propertyImageRepository: Repository<PropertyImage>,
  ) {}

  async create(data: CreatePropertyImageDto): Promise<PropertyImage> {
    const image = this.propertyImageRepository.create(data);
    return this.propertyImageRepository.save(image);
  }

  async findAllByProperty(propertyId: string): Promise<PropertyImage[]> {
    return this.propertyImageRepository.find({ where: { property: { id: propertyId } }, order: { order: 'ASC' } });
  }

  async update(id: string, updateImageDto: UpdatePropertyImageDto): Promise<PropertyImage> {
    const image = await this.propertyImageRepository.findOne({ 
      where: { id }, 
      relations: ['property'] 
    });
    if (!image) throw new NotFoundException('Property image not found');

    // If setting this image as favorite, unset all other favorites for this property
    if (updateImageDto.isFavorite === true) {
      await this.propertyImageRepository.createQueryBuilder()
        .update(PropertyImage)
        .set({ isFavorite: false })
        .where('property.id = :propertyId', { propertyId: image.property.id })
        .execute();
    }

    // Update the current image
    await this.propertyImageRepository.update(id, updateImageDto);
    
    // Return the updated image
    return this.propertyImageRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    const result = await this.propertyImageRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Property image not found');
  }

  async updateImageOrder(propertyId: string, imageOrderData: { id: string; order: number }[]): Promise<PropertyImage[]> {
    // Use a transaction to ensure all updates happen atomically
    return this.propertyImageRepository.manager.transaction(async (manager) => {
      for (const { id, order } of imageOrderData) {
        await manager.update(PropertyImage, { id }, { order });
      }
      
      // Return all images for the property in the new order
      return manager.find(PropertyImage, { 
        where: { property: { id: propertyId } }, 
        order: { order: 'ASC' } 
      });
    });
  }
}
