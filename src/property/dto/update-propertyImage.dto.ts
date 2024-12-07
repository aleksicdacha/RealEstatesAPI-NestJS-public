import { IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';

export class UpdatePropertyImageDto {
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
