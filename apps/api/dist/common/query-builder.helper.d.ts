import { SelectQueryBuilder } from 'typeorm';
export declare class QueryBuilderHelper {
    static applyQueryOptions<T>(queryBuilder: SelectQueryBuilder<T>, options: any, filters?: {
        [key: string]: any;
    }): void;
}
