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
    const image = await this.propertyImageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Property image not found');

    Object.assign(image, updateImageDto);
    return this.propertyImageRepository.save(image);
  }

  async delete(id: string): Promise<void> {
    const result = await this.propertyImageRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Property image not found');
  }
}
