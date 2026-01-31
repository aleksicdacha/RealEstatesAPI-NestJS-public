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
var PropertyRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const property_entity_1 = require("./property.entity");
const property_status_enum_1 = require("./enums/property-status.enum");
const filter_mappers_util_1 = require("./utils/filter-mappers.util");
let PropertyRepository = PropertyRepository_1 = class PropertyRepository extends typeorm_1.Repository {
    dataSource;
    logger = new common_1.Logger(PropertyRepository_1.name);
    constructor(dataSource) {
        super(property_entity_1.Property, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findFilteredProperties(options) {
        this.logger.debug(`Filtering properties with options: ${JSON.stringify(options)}`);
        const queryBuilder = this.createQueryBuilder('property');
        queryBuilder.leftJoinAndSelect('property.client', 'client');
        queryBuilder.leftJoinAndSelect('client.representative', 'representative');
        queryBuilder.leftJoinAndSelect('property.images', 'images');
        if (options.searchField && options.searchValue) {
            queryBuilder.andWhere(`property.${options.searchField} ILIKE :searchValue`, {
                searchValue: `%${options.searchValue}%`,
            });
        }
        if (options.status) {
            const statusArray = Array.isArray(options.status)
                ? options.status
                : options.status.split(',').map(s => s.trim());
            if (statusArray.length > 0) {
                queryBuilder.andWhere('property.status IN (:...statuses)', { statuses: statusArray });
            }
        }
        if (options.clientTransactionType) {
            queryBuilder.andWhere('client.transactionType = :clientTransactionType', {
                clientTransactionType: options.clientTransactionType
            });
            queryBuilder.andWhere('client.id IS NOT NULL');
        }
        if (options.propertyType) {
            const typeArray = Array.isArray(options.propertyType)
                ? options.propertyType
                : options.propertyType.split(',').map(t => t.trim());
            if (typeArray.length > 0) {
                queryBuilder.andWhere('property.propertyType IN (:...types)', { types: typeArray });
            }
        }
        if (options.minPrice !== undefined) {
            queryBuilder.andWhere('property.price >= :minPrice', { minPrice: options.minPrice });
        }
        if (options.maxPrice !== undefined) {
            queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: options.maxPrice });
        }
        if (options.minArea !== undefined) {
            queryBuilder.andWhere('property.area >= :minArea', { minArea: options.minArea });
        }
        if (options.maxArea !== undefined) {
            queryBuilder.andWhere('property.area <= :maxArea', { maxArea: options.maxArea });
        }
        if (options.elevator !== undefined) {
            queryBuilder.andWhere('property.elevator = :elevator', { elevator: options.elevator });
        }
        if (options.city) {
            if (options.city === 'Niš') {
                queryBuilder.andWhere('property.neighborhood NOT IN (:...beogradNeighborhoods)', {
                    beogradNeighborhoods: filter_mappers_util_1.BEOGRAD_NEIGHBORHOODS
                });
            }
            else if (options.city === 'Beograd') {
                queryBuilder.andWhere('property.neighborhood IN (:...beogradNeighborhoods)', {
                    beogradNeighborhoods: filter_mappers_util_1.BEOGRAD_NEIGHBORHOODS
                });
            }
        }
        if (options.neighborhoods && options.neighborhoods.length > 0) {
            const mappedNeighborhoods = filter_mappers_util_1.NeighborhoodMapper.mapBatch(options.neighborhoods);
            queryBuilder.andWhere('property.neighborhood IN (:...neighborhoods)', {
                neighborhoods: mappedNeighborhoods
            });
        }
        if (options.bathrooms && options.bathrooms.length > 0) {
            queryBuilder.andWhere('property.bathrooms IN (:...bathrooms)', {
                bathrooms: options.bathrooms
            });
        }
        if (options.floors && options.floors.length > 0) {
            const floorConditions = filter_mappers_util_1.FloorFilterMapper.mapFloors(options.floors);
            if (floorConditions.length > 0) {
                queryBuilder.andWhere(`(${floorConditions.join(' OR ')})`);
            }
        }
        if (options.roomStructure && options.roomStructure.length > 0) {
            const mappedStructures = filter_mappers_util_1.RoomStructureMapper.mapBatch(options.roomStructure);
            if (mappedStructures.length > 0) {
                queryBuilder.andWhere('property.roomStructure IN (:...roomStructures)', {
                    roomStructures: mappedStructures
                });
            }
        }
        if (options.heating && options.heating.length > 0) {
            queryBuilder.andWhere('property.heating IN (:...heating)', {
                heating: options.heating
            });
        }
        if (options.features && options.features.length > 0) {
            queryBuilder.andWhere('property.additionalEquipment @> :features', {
                features: JSON.stringify(options.features)
            });
        }
        queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
        queryBuilder.orderBy(`property.${options.sortBy}`, options.order);
        const [items, total] = await queryBuilder.getManyAndCount();
        return [items, total];
    }
    async softDeleteProperty(id) {
        await this.createQueryBuilder()
            .update(property_entity_1.Property)
            .set({ status: property_status_enum_1.PropertyStatus.Deleted })
            .where('id = :id', { id })
            .execute();
    }
};
exports.PropertyRepository = PropertyRepository;
exports.PropertyRepository = PropertyRepository = PropertyRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], PropertyRepository);
//# sourceMappingURL=property.repository.js.map