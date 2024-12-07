import { IsNotEmpty, IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';

export class CreatePropertyImageDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
