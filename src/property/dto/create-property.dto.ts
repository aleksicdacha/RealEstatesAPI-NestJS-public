import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { PropertyType, PropertyStatus } from '../property.entity';

export class CreatePropertyDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @IsNumber()
  price: number;

  @IsNumber()
  salePrice: number;

  @IsNumber()
  area: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment?: string;

  @IsOptional()
  @IsBoolean({ message: 'Comment must be a boolean' })
  elevator?: boolean;

  @IsString()
  address: string;

  @IsArray()
  images: string[];  // Array of image URLs

}
