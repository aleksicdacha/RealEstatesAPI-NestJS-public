import {
  IsOptional,
  IsIn,
  IsString,
  Min,
  Max,
  MinLength, IsInt,
} from 'class-validator';
import { VALID_SEARCH_FIELDS } from '@src/common/config/constants';
import { IsValidSearchField } from '@src/common/validators/search-field.validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

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
  @MinLength(3, { message: i18nValidationMessage('validation.search.minLength', { min: 3 }) })
  searchValue?: string;

  @IsOptional()
  @IsValidSearchField(VALID_SEARCH_FIELDS, { message: i18nValidationMessage('validation.search.invalidField') })
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
  @Min(1, { message: i18nValidationMessage('validation.pagination.pagePositive') })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: i18nValidationMessage('validation.pagination.limitPositive') })
  @Max(100, { message: i18nValidationMessage('validation.pagination.limitMax', { max: 100 }) })
  limit?: number;

  @IsOptional()
  filters?: string;
}
