import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePropertyImageDto {
  @IsOptional()
  @IsString()
  id?: string; // For existing images

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
