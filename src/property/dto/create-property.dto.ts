import { IsString, IsEnum, IsNumber, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { PropertyType, PropertyStatus } from '../property.entity'; // Enum for property type

export class CreatePropertyDto {
  // Required field for property name
  @IsString()
  code: string;

  // Required field for property description
  @IsString()
  description: string;

  // Required field for property type (apartment, house, office)
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  // Required field for property type (active, inactive, deleted)
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  // Required field for property price
  @IsNumber()
  price: number;

  // Required field for property price
  @IsNumber()
  salePrice: number;

  // Required field for property area
  @IsNumber()
  area: number;

  // Optional field for latitude, only if needed
  @IsOptional()  // Makes this field optional
  @IsNumber()
  lat?: number;

  // Optional field for longitude, only if needed
  @IsOptional()  // Makes this field optional
  @IsNumber()
  lon?: number;

  // Optional field for Comment, only if needed
  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment?: string;

  // Required field for Elevator, only if needed
  @IsBoolean({ message: 'Comment must be a boolean' })
  elevator: boolean;

  // Required field for property address
  @IsString()
  address: string;

}
