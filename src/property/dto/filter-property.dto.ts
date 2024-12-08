import { IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPropertyDto {
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
}
