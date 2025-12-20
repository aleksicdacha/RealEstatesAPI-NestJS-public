import { IsNotEmpty, IsNumber } from 'class-validator';

export class GeolocationFilterDto {
  @IsNumber()
  @IsNotEmpty()
  centerLatitude: number;

  @IsNumber()
  @IsNotEmpty()
  centerLongitude: number;

  @IsNumber()
  @IsNotEmpty()
  radiusKm: number; // Radius in kilometers
}
