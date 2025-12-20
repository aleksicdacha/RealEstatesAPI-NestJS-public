import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.token.required') })
  token: string;

  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.password.required') })
  @MinLength(6, { message: i18nValidationMessage('validation.password.minLength', { min: 6 }) })
  password: string;
}
