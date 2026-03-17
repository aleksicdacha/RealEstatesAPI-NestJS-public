import * as Joi from 'joi';
export declare const configValidationSchema: Joi.ObjectSchema<any>;
declare const _default: (() => {
    env: string;
    port: number;
    corsOrigin: string[];
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    corsOrigin: string[];
}>;
export default _default;
