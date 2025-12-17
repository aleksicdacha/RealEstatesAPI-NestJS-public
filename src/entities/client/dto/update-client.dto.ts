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
import { i18nValidationMessage } from 'nestjs-i18n';

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
  @Matches(/^(\+3816[0-6]|06[0-6])[0-9]{5,8}$/, {
    message: i18nValidationMessage('validation.client.phoneInvalid'),
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsNumber()
  moneyAmount: number;
}
