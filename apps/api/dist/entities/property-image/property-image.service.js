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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyImageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_image_entity_1 = require("./property-image.entity");
let PropertyImageService = class PropertyImageService {
    propertyImageRepository;
    constructor(propertyImageRepository) {
        this.propertyImageRepository = propertyImageRepository;
    }
    async create(data) {
        const image = this.propertyImageRepository.create(data);
        return this.propertyImageRepository.save(image);
    }
    async findAllByProperty(propertyId) {
        return this.propertyImageRepository.find({ where: { property: { id: propertyId } }, order: { order: 'ASC' } });
    }
    async update(id, updateImageDto) {
        const image = await this.propertyImageRepository.findOne({
            where: { id },
            relations: ['property']
        });
        if (!image)
            throw new common_1.NotFoundException('Property image not found');
        if (updateImageDto.isFavorite === true) {
            await this.propertyImageRepository.createQueryBuilder()
                .update(property_image_entity_1.PropertyImage)
                .set({ isFavorite: false })
                .where('property.id = :propertyId', { propertyId: image.property.id })
                .execute();
        }
        await this.propertyImageRepository.update(id, updateImageDto);
        return this.propertyImageRepository.findOne({ where: { id } });
    }
    async delete(id) {
        const result = await this.propertyImageRepository.delete(id);
        if (!result.affected)
            throw new common_1.NotFoundException('Property image not found');
    }
    async updateImageOrder(propertyId, imageOrderData) {
        return this.propertyImageRepository.manager.transaction(async (manager) => {
            for (const { id, order } of imageOrderData) {
                await manager.update(property_image_entity_1.PropertyImage, { id }, { order });
            }
            return manager.find(property_image_entity_1.PropertyImage, {
                where: { property: { id: propertyId } },
                order: { order: 'ASC' }
            });
        });
    }
};
exports.PropertyImageService = PropertyImageService;
exports.PropertyImageService = PropertyImageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_image_entity_1.PropertyImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PropertyImageService);
//# sourceMappingURL=property-image.service.js.map