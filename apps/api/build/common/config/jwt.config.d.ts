export declare const jwtConfig: (() => {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
}>;
