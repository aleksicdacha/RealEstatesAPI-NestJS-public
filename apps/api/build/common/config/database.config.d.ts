export declare const databaseConfig: (() => {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
}>;
