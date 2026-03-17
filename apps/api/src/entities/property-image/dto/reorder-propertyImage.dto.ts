import { IsString, IsInt } from 'class-validator';

export class ReorderPropertyImageDto {
  @IsString()
  id: string;

  @IsInt()
  order: number;
}