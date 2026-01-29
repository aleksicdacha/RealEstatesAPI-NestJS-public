"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsImmutable = IsImmutable;
const class_validator_1 = require("class-validator");
function IsImmutable(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isImmutable',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return value === undefined || value === null;
                },
                defaultMessage(args) {
                    return `${args.property} is immutable and cannot be updated.`;
                },
            },
        });
    };
}
//# sourceMappingURL=is-immutable.validator.js.map