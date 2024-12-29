import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  Matches, MinLength, MaxLength, IsNumber,
} from 'class-validator';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';

export class UpdateClientDTO {
  @IsOptional()
  @IsEnum(PaymentType, { message: 'Payment type must be one of the valid enum values: cash, credit, combined.' })
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'Transaction type must be one of the valid enum values: seller, rents, rents-out.' })
  transactionType?: TransactionType;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Status must be one of the valid enum values: active, inactive, deleted.' })
  status?: ClientStatus;

  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string.' })
  address?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string.' })
  @Matches(/^(\+3816[0-6]|06[0-6])[0-9]{5,8}$/, {
    message: 'Phone number must be a valid Serbian mobile number.',
  })
  phone?: string;

  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  comment?: string;

  @IsOptional()
  @IsNumber()
  moneyAmount: number;
}
