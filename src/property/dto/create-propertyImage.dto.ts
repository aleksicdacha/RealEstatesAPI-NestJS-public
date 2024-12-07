import { IsNotEmpty, IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';

export class CreatePropertyImageDto {
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
