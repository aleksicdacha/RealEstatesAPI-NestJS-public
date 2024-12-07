import { IsString, IsEnum, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { PropertyType } from '../property.entity'; // Enum for property type

export class CreatePropertyDto {
  // Required field for property name
  @IsString()
  name: string;

  // Required field for property description
  @IsString()
  description: string;

  // Required field for property type (apartment, house, office)
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  // Required field for property price
  @IsNumber()
  price: number;

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

  // Required field for property address
  @IsString()
  address: string;

  // Optional field for GUID if you want to generate it manually or use default UUID
  @IsOptional()  // Makes this field optional
  @IsUUID()
  guid?: string;
}
