import {
  IsOptional,
  IsIn,
  IsString,
  Min,
  Max,
  MinLength, IsInt,
} from 'class-validator';
import { VALID_SEARCH_FIELDS } from '../../common/config/constants';
import { IsValidSearchField } from '../../common/validators/search-field.validator';
import { Type } from 'class-transformer';

export class FiltersDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'searchValue must be at least 3 characters long' })
  searchValue?: string;

  @IsOptional()
  @IsValidSearchField(VALID_SEARCH_FIELDS, { message: 'Invalid search field provided' })
  searchField?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  @IsIn(['username', 'role'])
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'page must be a positive number' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit must be a positive number' })
  @Max(100, { message: 'limit must not be greater than 100' })
  limit?: number;

  @IsOptional()
  filters?: string;
}
