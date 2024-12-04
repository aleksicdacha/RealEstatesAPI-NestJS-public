import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationQueryDto {
  @IsNumber()
  @Min(1, { message: 'page must be a positive number' })
  @Transform(({ value }) => Number(value)) // Transform to number
  readonly page: number;

  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Max(100, { message: 'limit must not be greater than 100' })
  @Transform(({ value }) => Number(value)) // Transform to number
  readonly limit: number;

  @IsOptional()
  @IsString()
  readonly searchField?: string;

  @IsOptional()
  @IsString()
  readonly searchValue?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'order must be ASC or DESC' })
  readonly order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  readonly sortBy?: string;
}