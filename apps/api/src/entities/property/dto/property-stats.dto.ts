import { IsOptional, IsDateString } from 'class-validator';

export class PropertyStatsDto {
  propertyType: string;
  averagePrice: number;
  count: number;
}

export class PropertyStatsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
