import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.username.required') })
  username: string;

  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.password.required') })
  password: string;

  @IsEnum(Role, { message: i18nValidationMessage('validation.role.invalid') })
  role: Role;
}
