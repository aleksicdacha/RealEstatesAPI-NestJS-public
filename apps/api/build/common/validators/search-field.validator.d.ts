import { ValidationOptions } from 'class-validator';
export declare function IsValidSearchField(allowedFields: string[], validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
