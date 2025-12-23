import { IsNotEmpty, IsBoolean, IsOptional, IsUrl, IsNumber } from 'class-validator';

export class CreatePropertyImageDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsBoolean()
  isFavorite: boolean;

  @IsOptional()
  @IsNumber()
  order: number;
}
