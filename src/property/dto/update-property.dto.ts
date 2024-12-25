import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { PropertyType, PropertyStatus } from '../property.entity';
import { Type } from 'class-transformer';
import { UpdatePropertyImageDto } from '@src/property-image/dto/update-propertyImage.dto';
import { IsImmutable } from '@src/common/validators/is-immutable.validator';

export class UpdatePropertyDTO {
  @IsImmutable({ message: 'Code cannot be updated once created.' })
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

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
  elevator?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePropertyImageDto)
  images?: UpdatePropertyImageDto[];
}
