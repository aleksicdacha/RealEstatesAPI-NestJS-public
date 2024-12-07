import { IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';

export class UpdatePropertyImageDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
