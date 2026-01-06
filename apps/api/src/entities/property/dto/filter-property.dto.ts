import { IsOptional, IsString, IsEnum, Min, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterPropertyDto {
    @IsOptional()
    @IsString()
    clientTransactionType?: string;
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  searchField?: string;

  @IsOptional()
  @IsString()
  searchValue?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minArea?: number;

  @IsOptional()
  @Type(() => Number)
  maxArea?: number;

  // Additional filters
  @IsOptional()
  @Type(() => Number)
  minLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  maxLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  minLongitude?: number;

  @IsOptional()
  @Type(() => Number)
  maxLongitude?: number;

  @IsOptional()
  @Type(() => Boolean)
  elevator?: boolean;

  // Advanced filters
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  @IsArray()
  neighborhoods?: string[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',').map(Number) : value)
  @IsArray()
  bathrooms?: number[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  @IsArray()
  floors?: string[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  @IsArray()
  roomStructure?: string[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  @IsArray()
  heating?: string[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  @IsArray()
  features?: string[];
}

