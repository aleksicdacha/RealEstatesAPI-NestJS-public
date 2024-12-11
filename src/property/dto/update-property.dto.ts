import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { PropertyType, PropertyStatus } from '../property.entity'; // Enum for property type

export class UpdatePropertyDTO {
  // Optional field to update the name
  @IsOptional()  // Makes this field optional when updating
  @IsString()
  name?: string;

  // Optional field to update the description
  @IsOptional()  // Makes this field optional when updating
  @IsString()
  description?: string;

  // Optional field for the property type
  @IsOptional()  // Makes this field optional when updating
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  // Optional field for the property type
  @IsOptional()  // Makes this field optional when updating
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  // Optional field for the property price (can be updated)
  @IsOptional()  // Makes this field optional when updating
  @IsNumber()
  price?: number;

  // Optional field for the property salePrice (can be updated)
  @IsOptional()  // Makes this field optional when updating
  @IsNumber()
  salePrice?: number;

  // Optional field for the property area (can be updated)
  @IsOptional()  // Makes this field optional when updating
  @IsNumber()
  area?: number;

  // Optional field for latitude
  @IsOptional()  // Makes this field optional when updating
  @IsNumber()
  lat?: number;

  // Optional field for longitude
  @IsOptional()  // Makes this field optional when updating
  @IsNumber()
  lon?: number;

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment?: string;

  @IsBoolean({ message: 'Elevator must be a boolean' })
  @IsNotEmpty({ message: 'Elevator field is required' })
  elevator: boolean;

  // Optional field for the address
  @IsOptional()  // Makes this field optional when updating
  @IsString()
  address?: string;
}
