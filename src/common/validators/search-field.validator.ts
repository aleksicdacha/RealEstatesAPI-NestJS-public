import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidSearchField(allowedFields: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSearchField',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [allowedFields],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [allowedFields] = args.constraints;
          return allowedFields.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedFields] = args.constraints;
          return `Invalid search field. Allowed fields are: ${allowedFields.join(', ')}`;
        },
      },
    });
  };
}
