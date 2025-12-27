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
exports.PropertyService = void 0;
const common_1 = require("@nestjs/common");
const property_entity_1 = require("./property.entity");
const nestjs_typeorm_paginate_1 = require("nestjs-typeorm-paginate");
const typeorm_1 = require("typeorm");
const property_repository_1 = require("./property.repository");
const property_image_repository_1 = require("../property-image/property-image.repository");
let PropertyService = class PropertyService {
    propertyRepository;
    propertyImageRepository;
    dataSource;
    constructor(propertyRepository, propertyImageRepository, dataSource) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.dataSource = dataSource;
    }
    async reorganizeSpecialOffers(newSpecialOffer, excludePropertyId) {
        if (!newSpecialOffer || newSpecialOffer < 1 || newSpecialOffer > 20) {
            return;
        }
        const whereCondition = {
            specialOffer: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
        };
        if (excludePropertyId) {
            whereCondition.id = (0, typeorm_1.Not)(excludePropertyId);
        }
        const affectedProperties = await this.propertyRepository.find({
            where: whereCondition,
            order: { specialOffer: 'DESC' },
        });
        const toShift = affectedProperties.filter(p => p.specialOffer >= newSpecialOffer);
        for (const property of toShift) {
            const newValue = property.specialOffer + 1;
            if (newValue > 20) {
                await this.propertyRepository.update(property.id, { specialOffer: null });
            }
            else {
                await this.propertyRepository.update(property.id, { specialOffer: newValue });
            }
        }
    }
    async create(createPropertyDto) {
        const { code, images, specialOffer, ...propertyData } = createPropertyDto;
        const existingProperty = await this.propertyRepository.findOne({ where: { code } });
        if (existingProperty) {
            throw new common_1.ConflictException(`Property with code "${code}" already exists.`);
        }
        if (specialOffer && specialOffer >= 1 && specialOffer <= 20) {
            await this.reorganizeSpecialOffers(specialOffer);
        }
        try {
            const property = this.propertyRepository.create({
                code,
                ...propertyData,
                specialOffer: (specialOffer && specialOffer >= 1 && specialOffer <= 20) ? specialOffer : null,
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
        catch (e) {
            console.log('error', e);
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
            if (specialOffer && specialOffer >= 1 && specialOffer <= 20) {
                await this.reorganizeSpecialOffers(specialOffer, id);
            }
        }
        const updatedData = {
            ...propertyData,
            code,
            additionalEquipment: additionalEquipment ?? null,
            specialOffer: (specialOffer && specialOffer >= 1 && specialOffer <= 20) ? specialOffer : null,
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
            console.warn(`Property with id "${id}" has no associated client.`);
        }
        else {
            console.log('Client ID:', property.client.id);
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
                console.log(`Removing property with ID: ${id}`);
                if (property.images && property.images.length > 0) {
                    console.log(`Found ${property.images.length} associated images for property ID: ${id}`);
                    await this.propertyImageRepository.handlePropertyImagesParallel(manager, id, property.images);
                }
                else {
                    console.log(`No images associated with property ID: ${id}`);
                }
                await manager.delete(property_entity_1.Property, { id });
                console.log(`Property with ID ${id} successfully removed.`);
            });
        }
        catch (error) {
            console.log(error);
            console.error(`Failed to remove property with ID ${id}:`, error);
            throw error;
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
        const cyrillicToLatin = (text) => {
            const cyrillicToLatinMap = {
                'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
                'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Ђ': 'Đ', 'ђ': 'đ',
                'Е': 'E', 'е': 'e', 'Ж': 'Ž', 'ж': 'ž', 'З': 'Z', 'з': 'z',
                'И': 'I', 'и': 'i', 'Ј': 'J', 'ј': 'j', 'К': 'K', 'к': 'k',
                'Л': 'L', 'л': 'l', 'Љ': 'Lj', 'љ': 'lj', 'М': 'M', 'м': 'm',
                'Н': 'N', 'н': 'n', 'Њ': 'Nj', 'њ': 'nj', 'О': 'O', 'о': 'o',
                'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
                'Т': 'T', 'т': 't', 'Ћ': 'Ć', 'ћ': 'ć', 'У': 'U', 'у': 'u',
                'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'C', 'ц': 'c',
                'Ч': 'Č', 'ч': 'č', 'Џ': 'Dž', 'џ': 'dž', 'Ш': 'Š', 'š': 'š'
            };
            return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
        };
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
                const cityName = cityPart.replace(/\s+\d+.*$/, '').trim();
                return cyrillicToLatin(cityName);
            }
            return null;
        })
            .filter(c => c && c.length > 0);
        const uniqueCities = [...new Set(cities)].sort();
        const neighborhoods = await this.propertyRepository
            .createQueryBuilder('property')
            .select('DISTINCT property.neighborhood', 'neighborhood')
            .where('property.neighborhood IS NOT NULL')
            .orderBy('property.neighborhood', 'ASC')
            .getRawMany();
        return {
            cities: uniqueCities,
            neighborhoods: neighborhoods
                .map(n => {
                const trimmed = n.neighborhood?.trim();
                return trimmed ? cyrillicToLatin(trimmed) : null;
            })
                .filter(n => n && n.length > 0),
        };
    }
};
exports.PropertyService = PropertyService;
exports.PropertyService = PropertyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [property_repository_1.PropertyRepository,
        property_image_repository_1.PropertyImageRepository,
        typeorm_1.DataSource])
], PropertyService);
//# sourceMappingURL=property.service.js.map