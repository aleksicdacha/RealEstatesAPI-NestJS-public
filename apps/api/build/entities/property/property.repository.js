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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const property_entity_1 = require("./property.entity");
const property_status_enum_1 = require("./enums/property-status.enum");
let PropertyRepository = class PropertyRepository extends typeorm_1.Repository {
    dataSource;
    constructor(dataSource) {
        super(property_entity_1.Property, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findFilteredProperties(options) {
        console.log('🔍 Backend received filter options:', JSON.stringify(options, null, 2));
        const queryBuilder = this.createQueryBuilder('property');
        queryBuilder.leftJoinAndSelect('property.client', 'client');
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
        if (options.city) {
            queryBuilder.andWhere('LOWER(property.address) LIKE LOWER(:city)', {
                city: `%${options.city}%`
            });
        }
        if (options.neighborhoods && options.neighborhoods.length > 0) {
            const neighborhoodMap = {
                'medijana': 'Medijana',
                'palilula': 'Palilula',
                'pantelej': 'Pantelej',
                'crveni-krst': 'Crveni Krst',
                'niska-banja': 'Niška Banja',
                'bubanj': 'Bubanj',
                'duvaniste': 'Duvanjište',
                'cair': 'Čair',
                'bulevar': 'Bulevar',
                'vrezina': 'Vrežina',
                'durlan': 'Durlan',
                'beverly-hills': 'Beverly Hills',
                'jagodin-mala': 'Jagodin mala',
                'marger': 'Marger',
                'brzi-brod': 'Brzi Brod',
                'centar': 'Centar',
                'klinicki-centar': 'Klinički centar',
                'calije': 'Čalije',
                'pantelijmon': 'Pantelijmon',
                'vidriste': 'Vidrište',
                'pevac': 'Pevac',
                'cele-kula': 'Čele kula',
            };
            const mappedNeighborhoods = options.neighborhoods.map(n => neighborhoodMap[n.toLowerCase()] || n);
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
            const floorConditions = options.floors.map((floor, index) => {
                if (floor === '2-4') {
                    return `(property.floor >= 2 AND property.floor <= 4)`;
                }
                else if (floor === '5-10') {
                    return `(property.floor >= 5 AND property.floor <= 10)`;
                }
                else if (floor === '11+') {
                    return `property.floor >= 11`;
                }
                else {
                    return `property.floor = ${parseInt(floor) || 0}`;
                }
            });
            queryBuilder.andWhere(`(${floorConditions.join(' OR ')})`);
        }
        if (options.roomStructure && options.roomStructure.length > 0) {
            queryBuilder.andWhere('property.roomStructure IN (:...roomStructures)', {
                roomStructures: options.roomStructure
            });
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
exports.PropertyRepository = PropertyRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], PropertyRepository);
//# sourceMappingURL=property.repository.js.map