"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SpecialOfferManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialOfferManager = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../property.entity");
let SpecialOfferManager = SpecialOfferManager_1 = class SpecialOfferManager {
    dataSource;
    logger = new common_1.Logger(SpecialOfferManager_1.name);
    MAX_SPECIAL_OFFER = 20;
    MIN_SPECIAL_OFFER = 1;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async reorganize(newSpecialOffer, excludePropertyId) {
        if (!this.isValidSpecialOffer(newSpecialOffer)) {
            return;
        }
        await this.dataSource.transaction(async (manager) => {
            const queryBuilder = manager
                .createQueryBuilder(property_entity_1.Property, 'property')
                .where('property.specialOffer IS NOT NULL')
                .andWhere('property.specialOffer >= :newSpecialOffer', { newSpecialOffer })
                .orderBy('property.specialOffer', 'DESC');
            if (excludePropertyId) {
                queryBuilder.andWhere('property.id != :excludePropertyId', { excludePropertyId });
            }
            const affectedProperties = await queryBuilder.getMany();
            if (affectedProperties.length === 0) {
                return;
            }
            const toSetNull = affectedProperties
                .filter(p => (p.specialOffer + 1) > this.MAX_SPECIAL_OFFER)
                .map(p => p.id);
            if (toSetNull.length > 0) {
                await manager
                    .createQueryBuilder()
                    .update(property_entity_1.Property)
                    .set({ specialOffer: null })
                    .whereInIds(toSetNull)
                    .execute();
                this.logger.debug(`Set ${toSetNull.length} properties to null (exceeded max ${this.MAX_SPECIAL_OFFER})`);
            }
            const toIncrement = affectedProperties
                .filter(p => (p.specialOffer + 1) <= this.MAX_SPECIAL_OFFER)
                .map(p => p.id);
            if (toIncrement.length > 0) {
                await manager
                    .createQueryBuilder()
                    .update(property_entity_1.Property)
                    .set({ specialOffer: () => '"specialOffer" + 1' })
                    .whereInIds(toIncrement)
                    .execute();
                this.logger.debug(`Incremented specialOffer for ${toIncrement.length} properties`);
            }
        });
    }
    isValidSpecialOffer(value) {
        return value !== null
            && value !== undefined
            && value >= this.MIN_SPECIAL_OFFER
            && value <= this.MAX_SPECIAL_OFFER;
    }
    normalizeSpecialOffer(value) {
        return this.isValidSpecialOffer(value) ? value : null;
    }
};
exports.SpecialOfferManager = SpecialOfferManager;
exports.SpecialOfferManager = SpecialOfferManager = SpecialOfferManager_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SpecialOfferManager);
//# sourceMappingURL=special-offer.manager.js.map