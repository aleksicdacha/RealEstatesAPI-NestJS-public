"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidSearchField = IsValidSearchField;
const class_validator_1 = require("class-validator");
function IsValidSearchField(allowedFields, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isValidSearchField',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [allowedFields],
            validator: {
                validate(value, args) {
                    const [allowedFields] = args.constraints;
                    return allowedFields.includes(value);
                },
                defaultMessage(args) {
                    const [allowedFields] = args.constraints;
                    return `Invalid search field. Allowed fields are: ${allowedFields.join(', ')}`;
                },
            },
        });
    };
}
//# sourceMappingURL=search-field.validator.js.map