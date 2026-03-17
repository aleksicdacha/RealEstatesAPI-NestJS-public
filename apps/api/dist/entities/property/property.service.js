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
var PropertyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const common_1 = require("@nestjs/common");
const property_entity_1 = require("./property.entity");
const nestjs_typeorm_paginate_1 = require("nestjs-typeorm-paginate");
const typeorm_1 = require("typeorm");
const property_repository_1 = require("./property.repository");
const property_image_repository_1 = require("../property-image/property-image.repository");
const special_offer_manager_1 = require("./utils/special-offer.manager");
const text_normalizer_util_1 = require("./utils/text-normalizer.util");
let PropertyService = PropertyService_1 = class PropertyService {
    propertyRepository;
    propertyImageRepository;
    dataSource;
    specialOfferManager;
    logger = new common_1.Logger(PropertyService_1.name);
    constructor(propertyRepository, propertyImageRepository, dataSource, specialOfferManager) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.dataSource = dataSource;
        this.specialOfferManager = specialOfferManager;
    }
    async create(createPropertyDto) {
        const { code, images, specialOffer, ...propertyData } = createPropertyDto;
        const existingProperty = await this.propertyRepository.findOne({ where: { code } });
        if (existingProperty) {
            throw new common_1.ConflictException(`Property with code "${code}" already exists.`);
        }
        const normalizedSpecialOffer = this.specialOfferManager.normalizeSpecialOffer(specialOffer);
        if (normalizedSpecialOffer !== null) {
            await this.specialOfferManager.reorganize(normalizedSpecialOffer);
        }
        try {
            const property = this.propertyRepository.create({
                code,
                ...propertyData,
                specialOffer: normalizedSpecialOffer,
            });
            const savedProperty = await this.propertyRepository.save(property);
            if (images && images.length > 0) {
                const propertyImages = images.map((imageUrl, index) => this.propertyImageRepository.create({
                    url: imageUrl,
                    isFavorite: index === 0,
                    order: index + 1,
                    property: savedProperty,
                }));
                await this.propertyImageRepository.save(propertyImages);
            }
            return await this.propertyRepository.findOne({
                where: { id: savedProperty.id },
                relations: ['images'],
            });
        }
        catch (error) {
            this.logger.error('Failed to create property', error.stack);
            throw new common_1.InternalServerErrorException('Failed to create property');
        }
    }
    async update(id, updatePropertyDto) {
        const { code, images, additionalEquipment, specialOffer, ...propertyData } = updatePropertyDto;
        const property = await this.propertyRepository.findOne({ where: { id }, relations: ['images'] });
        if (!property) {
            throw new common_1.NotFoundException(`Property with id "${id}" not found.`);
        }
        if (code && code !== property.code) {
            const existingProperty = await this.propertyRepository.findOne({ where: { code } });
            if (existingProperty) {
                throw new common_1.ConflictException(`Property with code "${code}" already exists.`);
            }
        }
        if (specialOffer !== undefined && specialOffer !== property.specialOffer) {
            const normalizedSpecialOffer = this.specialOfferManager.normalizeSpecialOffer(specialOffer);
            if (normalizedSpecialOffer !== null) {
                await this.specialOfferManager.reorganize(normalizedSpecialOffer, id);
            }
        }
        const updatedData = {
            ...propertyData,
            code,
            additionalEquipment: additionalEquipment ?? null,
            specialOffer: this.specialOfferManager.normalizeSpecialOffer(specialOffer),
        };
        await this.propertyRepository.update(id, updatedData);
        if (images) {
            const existingImageIds = property.images.map((img) => img.id);
            const newImages = images.filter((img) => !img.id);
            const imagesToUpdate = images.filter((img) => img.id);
            for (const img of imagesToUpdate) {
                if (existingImageIds.includes(img.id)) {
                    await this.propertyImageRepository.update(img.id, {
                        url: img.url,
                        isFavorite: img.isFavorite,
                        order: img.order,
                    });
                }
            }
            if (newImages.length > 0) {
                const propertyImages = newImages.map((image, index) => this.propertyImageRepository.create({
                    url: image.url,
                    isFavorite: image.isFavorite ?? false,
                    order: image.order ?? property.images.length + index + 1,
                    property,
                }));
                await this.propertyImageRepository.save(propertyImages);
            }
        }
        return this.propertyRepository.findOne({ where: { id }, relations: ['client', 'client.representative', 'images'] });
    }
    async findAll(options) {
        const paginationOptions = {
            ...options,
            page: options.page || 1,
            limit: options.limit || 10,
            sortBy: options.sortBy || 'createdAt',
            order: (options.order || 'DESC')
        };
        const [items, totalItems] = await this.propertyRepository.findFilteredProperties(paginationOptions);
        return new nestjs_typeorm_paginate_1.Pagination(items, {
            totalItems,
            itemCount: items.length,
            itemsPerPage: paginationOptions.limit,
            totalPages: Math.ceil(totalItems / paginationOptions.limit),
            currentPage: paginationOptions.page,
        });
    }
    async findAllPublic(options) {
        const paginationOptions = {
            ...options,
            status: 'active',
            page: options.page || 1,
            limit: options.limit || 10,
            sortBy: options.sortBy || 'createdAt',
            order: (options.order || 'DESC')
        };
        const [items, totalItems] = await this.propertyRepository.findFilteredProperties(paginationOptions);
        const publicItems = items.map(property => this.transformToPublicDto(property));
        return new nestjs_typeorm_paginate_1.Pagination(publicItems, {
            totalItems,
            itemCount: publicItems.length,
            itemsPerPage: paginationOptions.limit,
            totalPages: Math.ceil(totalItems / paginationOptions.limit),
            currentPage: paginationOptions.page,
        });
    }
    transformToPublicDto(property) {
        return {
            id: property.id,
            code: property.code,
            description: property.description,
            propertyType: property.propertyType,
            price: property.price,
            area: property.area,
            neighborhood: property.neighborhood,
            lat: property.lat,
            lon: property.lon,
            elevator: property.elevator,
            additionalEquipment: property.additionalEquipment || [],
            constructionYear: property.constructionYear,
            bathrooms: property.bathrooms,
            floor: property.floor,
            roomStructure: property.roomStructure,
            heating: property.heating,
            orientation: property.orientation,
            youtubeUrl: property.youtubeUrl,
            specialOffer: property.specialOffer,
            images: property.images?.map(img => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isFavorite,
                displayOrder: img.order,
            })) || [],
        };
    }
    async findOne(id) {
        const property = await this.propertyRepository.findOne({
            where: { id },
            relations: ['client', 'client.representative', 'images'],
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        if (!property.client) {
            this.logger.debug(`Property ${id} has no associated client`);
        }
        return {
            ...property,
            client: property.client ? {
                id: property.client.id,
                name: property.client.name,
                address: property.client.address,
                phone: property.client.phone,
                email: property.client.email,
                transactionType: property.client.transactionType,
                paymentType: property.client.paymentType,
                comment: property.client.comment,
                status: property.client.status,
                moneyAmount: property.client.moneyAmount,
                ownerJmbg: property.client.ownerJmbg,
                ownerBirthplace: property.client.ownerBirthplace,
                ownerIdCardNumber: property.client.ownerIdCardNumber,
                ownerIdCardIssuePlace: property.client.ownerIdCardIssuePlace,
                representative: property.client.representative,
            } : null,
        };
    }
    async findOnePublic(id) {
        const property = await this.propertyRepository.findOne({
            where: { id },
            relations: ['images'],
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return this.transformToPublicDto(property);
    }
    async remove(id) {
        try {
            await this.dataSource.transaction(async (manager) => {
                const property = await manager
                    .createQueryBuilder(property_entity_1.Property, 'property')
                    .leftJoinAndSelect('property.images', 'images')
                    .setLock('pessimistic_write', undefined, ['property'])
                    .where('property.id = :id', { id })
                    .getOne();
                if (!property) {
                    throw new common_1.NotFoundException(`Property with ID ${id} not found`);
                }
                this.logger.debug(`Removing property: ${id}`);
                if (property.images && property.images.length > 0) {
                    this.logger.debug(`Found ${property.images.length} associated images for property: ${id}`);
                    await this.propertyImageRepository.handlePropertyImagesParallel(manager, id, property.images);
                }
                await manager.delete(property_entity_1.Property, { id });
                this.logger.log(`Property ${id} successfully removed`);
            });
        }
        catch (error) {
            this.logger.error(`Failed to remove property ${id}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to remove property');
        }
    }
    async softDelete(id) {
        await this.dataSource.transaction(async (manager) => {
            const property = await manager.findOne(property_entity_1.Property, {
                where: { id },
                relations: ['images'],
                lock: { mode: 'pessimistic_write' },
            });
            if (!property) {
                throw new Error(`Property with ID ${id} not found`);
            }
            await this.propertyRepository.softDeleteProperty(id);
        });
    }
    async getAveragePriceByType(query) {
        const queryBuilder = this.propertyRepository.createQueryBuilder('property');
        if (query.startDate && query.endDate) {
            queryBuilder.where('property.createdAt BETWEEN :startDate AND :endDate', {
                startDate: query.startDate,
                endDate: query.endDate,
            });
        }
        else if (query.startDate) {
            queryBuilder.where('property.createdAt >= :startDate', {
                startDate: query.startDate,
            });
        }
        else if (query.endDate) {
            queryBuilder.where('property.createdAt <= :endDate', {
                endDate: query.endDate,
            });
        }
        const results = await queryBuilder
            .select('property.propertyType', 'propertyType')
            .addSelect('AVG(property.price)', 'averagePrice')
            .addSelect('COUNT(property.id)', 'count')
            .groupBy('property.propertyType')
            .getRawMany();
        return results.map(result => ({
            propertyType: result.propertyType,
            averagePrice: parseFloat(result.averagePrice),
            count: parseInt(result.count),
        }));
    }
    async getFilterOptions() {
        const citiesRaw = await this.propertyRepository
            .createQueryBuilder('property')
            .select('property.address', 'address')
            .where('property.address IS NOT NULL')
            .getRawMany();
        const cities = citiesRaw
            .map(row => {
            const parts = row.address.split(',');
            if (parts.length >= 2) {
                const cityPart = parts[1].trim();
                return cityPart.replace(/\s+\d+.*$/, '').trim();
            }
            return null;
        })
            .filter(c => c && c.length > 0);
        const normalizedCities = text_normalizer_util_1.TextNormalizer.normalizeBatch(cities);
        const uniqueCities = [...new Set(normalizedCities)].sort();
        const neighborhoods = await this.propertyRepository
            .createQueryBuilder('property')
            .select('DISTINCT property.neighborhood', 'neighborhood')
            .where('property.neighborhood IS NOT NULL')
            .orderBy('property.neighborhood', 'ASC')
            .getRawMany();
        const normalizedNeighborhoods = neighborhoods
            .map(n => n.neighborhood)
            .filter(n => n && n.trim().length > 0);
        return {
            cities: uniqueCities,
            neighborhoods: text_normalizer_util_1.TextNormalizer.normalizeBatch(normalizedNeighborhoods),
        };
    }
};
exports.PropertyService = PropertyService;
exports.PropertyService = PropertyService = PropertyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [property_repository_1.PropertyRepository,
        property_image_repository_1.PropertyImageRepository,
        typeorm_1.DataSource,
        special_offer_manager_1.SpecialOfferManager])
], PropertyService);
//# sourceMappingURL=property.service.js.map