import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}
