import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePropertyImageDto {
  @IsString()
  url: string;

  @IsBoolean()
  isFavorite: boolean;

  @IsNumber()
  order: number;
}