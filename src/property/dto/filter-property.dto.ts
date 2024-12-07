import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { PropertyStatus, PropertyType } from '@src/property/property.entity';

export class FilterPropertyDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  // @IsEnum(['Apartment', 'House', 'Office'])
  propertyType?: PropertyType;

  @IsOptional()
  // @IsEnum(['active', 'inactive', 'deleted'])
  status?: PropertyStatus;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  minArea?: number;

  @IsOptional()
  @IsNumber()
  maxArea?: number;

  @IsOptional()
  @IsNumber()
  minLatitude?: number;

  @IsOptional()
  @IsNumber()
  maxLatitude?: number;

  @IsOptional()
  @IsNumber()
  minLongitude?: number;

  @IsOptional()
  @IsNumber()
  maxLongitude?: number;
}
