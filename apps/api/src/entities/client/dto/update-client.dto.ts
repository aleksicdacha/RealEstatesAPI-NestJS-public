import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  Matches, MinLength, MaxLength, IsNumber, Length, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UpdateRepresentativeDto } from '@src/entities/representative/dto/update-representative.dto';

export class UpdateClientDTO {
  @IsOptional()
  @IsEnum(PaymentType, { message: i18nValidationMessage('validation.client.paymentTypeInvalid') })
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(TransactionType, { message: i18nValidationMessage('validation.client.transactionTypeInvalid') })
  transactionType?: TransactionType;

  @IsOptional()
  @IsEnum(ClientStatus, { message: i18nValidationMessage('validation.client.statusInvalid') })
  status?: ClientStatus;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.client.emailInvalid') })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsNumber()
  moneyAmount?: number;

  @IsOptional()
  @IsString()
  propertyId?: string | null;

  // Owner extended fields (name, address, phone use Client base fields)
  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'JMBG must be exactly 13 digits.' })
  @Matches(/^\d{13}$/, { message: 'JMBG must contain only digits.' })
  ownerJmbg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ownerBirthplace?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ownerIdCardNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ownerIdCardIssuePlace?: string;

  // Representative (optional)
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRepresentativeDto)
  representative?: UpdateRepresentativeDto;
}
