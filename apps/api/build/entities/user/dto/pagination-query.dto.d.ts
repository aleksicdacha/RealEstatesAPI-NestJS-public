export declare class PaginationQueryDto {
    readonly page: number;
    readonly limit: number;
    readonly searchField?: string;
    readonly searchValue?: string;
    readonly order?: 'ASC' | 'DESC';
    readonly sortBy?: string;
}
