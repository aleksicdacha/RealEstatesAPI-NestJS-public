import { DataSource } from 'typeorm';
export declare class SpecialOfferManager {
    private readonly dataSource;
    private readonly logger;
    private readonly MAX_SPECIAL_OFFER;
    private readonly MIN_SPECIAL_OFFER;
    constructor(dataSource: DataSource);
    reorganize(newSpecialOffer: number, excludePropertyId?: string): Promise<void>;
    isValidSpecialOffer(value: number | null | undefined): boolean;
    normalizeSpecialOffer(value: number | null | undefined): number | null;
}
