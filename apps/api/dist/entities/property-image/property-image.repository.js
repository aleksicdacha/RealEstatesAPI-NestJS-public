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
var PropertyImageRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyImageRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const property_image_entity_1 = require("./property-image.entity");
const promises_1 = require("fs/promises");
const path_1 = require("path");
let PropertyImageRepository = PropertyImageRepository_1 = class PropertyImageRepository extends typeorm_1.Repository {
    dataSource;
    logger = new common_1.Logger(PropertyImageRepository_1.name);
    constructor(dataSource) {
        super(property_image_entity_1.PropertyImage, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async deleteImagesByPropertyId(propertyId) {
        await this.createQueryBuilder('propertyImage')
            .delete()
            .from(property_image_entity_1.PropertyImage)
            .where('propertyId = :propertyId', { propertyId })
            .execute();
    }
    async isImageUsedByOtherProperties(url, propertyId) {
        const count = await this.createQueryBuilder('propertyImage')
            .where('propertyImage.url = :url', { url })
            .andWhere('propertyImage.propertyId != :propertyId', { propertyId })
            .getCount();
        return count > 0;
    }
    async handlePropertyImagesParallel(manager, propertyId, images) {
        const deleteFilePromises = images.map(async (image) => {
            if (!image.url) {
                this.logger.warn(`Image URL is undefined for image record in property ${propertyId}`);
                return;
            }
            const isUsedByOtherProperties = await this.isImageUsedByOtherProperties(image.url, propertyId);
            if (!isUsedByOtherProperties) {
                await this.deleteImageFile(image.url);
            }
        });
        await Promise.all(deleteFilePromises);
        await this.deleteImagesByPropertyId(propertyId);
    }
    async deleteImageFile(filePath) {
        const basePath = process.env.FILE_UPLOAD_PATH || '/var/www/RealEstatesAPI-NestJS/uploads';
        const fullPath = (0, path_1.join)(basePath, filePath);
        try {
            await (0, promises_1.access)(fullPath);
            await (0, promises_1.unlink)(fullPath);
            this.logger.debug(`Deleted file: ${fullPath}`);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                this.logger.warn(`File not found: ${fullPath}, skipping deletion`);
            }
            else {
                this.logger.error(`Failed to delete file: ${fullPath}`, error.stack);
                throw error;
            }
        }
    }
};
exports.PropertyImageRepository = PropertyImageRepository;
exports.PropertyImageRepository = PropertyImageRepository = PropertyImageRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], PropertyImageRepository);
//# sourceMappingURL=property-image.repository.js.map