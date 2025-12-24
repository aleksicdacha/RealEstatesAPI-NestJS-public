import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer'; // To handle nested validation
import { HeatingType } from '@src/entities/property/enums/heating.enum';
import { PropertyType } from '@src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';

export class CreatePropertyDto {
  @IsString()
  id: string;

  @IsString()
  @MinLength(3, { message: 'Code must be at least 3 characters long.' })
  @MaxLength(20, { message: 'Code must not exceed 20 characters.' })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters.' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Additional equipment must be an array of strings.' })
  @IsString({ each: true, message: 'Each additional equipment item must be a string.' })
  additionalEquipment?: string[];

  @IsEnum(PropertyType, { message: 'Invalid property type.' })
  propertyType: PropertyType;

  @IsOptional()
  @IsEnum(PropertyStatus, { message: 'Invalid property status.' })
  status: PropertyStatus;

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Price must be a valid number.' },
  )
  @Min(0, { message: 'Price cannot be less than 0.' })
  @Max(1_000_000_000, { message: 'Price cannot exceed 1 billion.' })
  price: number;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Sale price must be a valid number.' },
  )
  @Min(0, { message: 'Sale price cannot be less than 0.' })
  @Max(1_000_000_000, { message: 'Sale price cannot exceed 1 billion.' })
  salePrice?: number;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Area must be a valid number.' },
  )
  @Min(1, { message: 'Area must be at least 1 square meter.' })
  @Max(100_000, { message: 'Area cannot exceed 100,000 square meters.' })
  area?: number;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Latitude must be a valid number.' },
  )
  @Min(-90, { message: 'Latitude cannot be less than -90.' })
  @Max(90, { message: 'Latitude cannot exceed 90.' })
  lat?: number;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Longitude must be a valid number.' },
  )
  @Min(-180, { message: 'Longitude cannot be less than -180.' })
  @Max(180, { message: 'Longitude cannot exceed 180.' })
  lon?: number;

  @IsOptional()
  @IsString({ message: 'Comment must be a string.' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters.' })
  comment?: string;


  @IsOptional()
  @IsBoolean({ message: 'Elevator must be a boolean value.' })
  elevator?: boolean;

  @IsString()
  @MaxLength(255, { message: 'Address must not exceed 255 characters.' })
  address: string;

  @IsOptional()
  @IsString({ message: 'Neighborhood must be a string.' })
  @MaxLength(255, { message: 'Neighborhood must not exceed 255 characters.' })
  neighborhood?: string;

  @IsOptional()
  @IsInt({ message: 'Construction year must be an integer.' })
  @Min(1900, { message: 'Construction year must be no earlier than 1900.' })
  @Max(new Date().getFullYear(), {
    message: 'Construction year cannot be in the future.',
  })
  constructionYear?: number;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Bathrooms must be a valid number.' },
  )
  @Min(0, { message: 'Bathrooms cannot be less than 0.' })
  @Max(50, { message: 'Bathrooms cannot exceed 50.' })
  bathrooms?: number;

  @IsOptional()
  @IsInt({ message: 'Floor must be an integer value.' })
  @Min(-5, { message: 'Floor cannot be lower than -5 (e.g., basements).' })
  @Max(200, { message: 'Floor cannot exceed 200.' })
  floor?: number;

  // Room structure: garsonjera, jednosoban, dvosoban, trosoban, četvorosoban, četvoroiposoban, petosoban i veći, etc.
  @IsOptional()
  @IsString({ message: 'Room structure must be a string.' })
  @MaxLength(50, { message: 'Room structure must not exceed 50 characters.' })
  roomStructure?: string;

  @IsOptional()
  @IsEnum(HeatingType, { message: 'Invalid heating type.' })
  heating?: HeatingType;

  @IsOptional()
  @IsArray({ message: 'Images must be an array of URLs.' })
  @ValidateNested({ each: true })
  @Type(() => String)
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL.' })
  images?: string[]; // Array of image URLs
}
