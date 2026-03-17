import { IsString, IsOptional, MaxLength, Length, Matches } from 'class-validator';

export class UpdateRepresentativeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'JMBG must be exactly 13 digits.' })
  @Matches(/^\d{13}$/, { message: 'JMBG must contain only digits.' })
  jmbg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  birthplace?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  idCardNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  idCardIssuePlace?: string;
}
