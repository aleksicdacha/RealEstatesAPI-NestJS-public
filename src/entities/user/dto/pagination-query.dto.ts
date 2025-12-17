import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PaginationQueryDto {
  @IsNumber()
  @Min(1, { message: i18nValidationMessage('validation.pagination.pagePositive') })
  @Transform(({ value }) => Number(value)) // Transform to number
  readonly page: number;

  @IsNumber()
  @Min(1, { message: i18nValidationMessage('validation.pagination.limitPositive') })
  @Max(100, { message: i18nValidationMessage('validation.pagination.limitMax', { max: 100 }) })
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
  @IsIn(['ASC', 'DESC'], { message: i18nValidationMessage('validation.pagination.orderInvalid') })
  readonly order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  readonly sortBy?: string;
}