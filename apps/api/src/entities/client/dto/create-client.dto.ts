import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  Matches, IsUUID, MinLength, MaxLength, IsNumber,
} from 'class-validator';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';

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
}
