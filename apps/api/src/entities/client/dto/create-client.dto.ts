import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  Matches, IsUUID, MinLength, MaxLength, IsNumber, Length, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { CreateRepresentativeDto } from '@src/entities/representative/dto/create-representative.dto';

export class CreateClientDTO {
  @IsOptional()
  @IsEnum(PaymentType, { message: 'Payment type must be one of the valid enum values: cash, credit, combined.' })
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'Transaction type must be one of the valid enum values: seller, buyer, rents, rents-out.' })
  transactionType?: TransactionType;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Status must be one of the valid enum values: active, inactive, deleted.' })
  status?: ClientStatus;

  @IsString({ message: 'Name must be a string.' })
  name: string;

  @IsString({ message: 'Address must be a string.' })
  address: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email?: string;

  @IsString({ message: 'Phone number must be a string.' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment?: string;

  @IsOptional()
  @IsNumber()
  moneyAmount?: number | null;

  @IsOptional()
  @IsUUID()
  property?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

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
  @Type(() => CreateRepresentativeDto)
  representative?: CreateRepresentativeDto;
}
