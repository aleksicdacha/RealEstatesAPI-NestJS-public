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
exports.PropertyImageController = void 0;
const common_1 = require("@nestjs/common");
const property_image_service_1 = require("./property-image.service");
const create_propertyImage_dto_1 = require("./dto/create-propertyImage.dto");
const update_propertyImage_dto_1 = require("./dto/update-propertyImage.dto");
let PropertyImageController = class PropertyImageController {
    propertyImageService;
    constructor(propertyImageService) {
        this.propertyImageService = propertyImageService;
    }
    create(createImageDto) {
        return this.propertyImageService.create(createImageDto);
    }
    findAllByProperty(propertyId) {
        return this.propertyImageService.findAllByProperty(propertyId);
    }
    updateOrder(propertyId, orderData) {
        return this.propertyImageService.updateImageOrder(propertyId, orderData);
    }
    update(id, updateImageDto) {
        return this.propertyImageService.update(id, updateImageDto);
    }
    delete(id) {
        return this.propertyImageService.delete(id);
    }
};
exports.PropertyImageController = PropertyImageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_propertyImage_dto_1.CreatePropertyImageDto]),
    __metadata("design:returntype", void 0)
], PropertyImageController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertyImageController.prototype, "findAllByProperty", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: false, whitelist: false })),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], PropertyImageController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_propertyImage_dto_1.UpdatePropertyImageDto]),
    __metadata("design:returntype", void 0)
], PropertyImageController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertyImageController.prototype, "delete", null);
exports.PropertyImageController = PropertyImageController = __decorate([
    (0, common_1.Controller)('properties/:propertyId/images'),
    __metadata("design:paramtypes", [property_image_service_1.PropertyImageService])
], PropertyImageController);
//# sourceMappingURL=property-image.controller.js.map