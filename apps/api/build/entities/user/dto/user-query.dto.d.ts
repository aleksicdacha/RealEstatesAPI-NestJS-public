export declare class FiltersDto {
    role?: string;
    username?: string;
}
export declare class UserQueryDto {
    searchValue?: string;
    searchField?: string;
    order?: 'ASC' | 'DESC';
    sortBy?: string;
    page?: number;
    limit?: number;
    filters?: string;
}
