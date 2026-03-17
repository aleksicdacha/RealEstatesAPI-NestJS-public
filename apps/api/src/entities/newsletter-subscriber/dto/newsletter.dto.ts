import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SubscribeNewsletterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SendNewsletterDto {
  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  // Content can contain HTML - will be sanitized before sending
  content: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];
}

export class UnsubscribeNewsletterDto {
  @IsNotEmpty()
  token: string;
}

export class GetNewsletterSubscribersDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === '1' || value === 1 || value === 'active') {
      return true;
    }
    if (value === false || value === 'false' || value === '0' || value === 0 || value === 'inactive') {
      return false;
    }
    return undefined;
  })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Date)
  subscribedFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  subscribedTo?: Date;
}