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
exports.PropertyController = void 0;
const common_1 = require("@nestjs/common");
const property_service_1 = require("./property.service");
const create_property_dto_1 = require("./dto/create-property.dto");
const update_property_dto_1 = require("./dto/update-property.dto");
const filter_property_dto_1 = require("./dto/filter-property.dto");
const property_stats_dto_1 = require("./dto/property-stats.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
let PropertyController = class PropertyController {
    propertyService;
    constructor(propertyService) {
        this.propertyService = propertyService;
    }
    async create(createPropertyDto, files) {
        return await this.propertyService.create(createPropertyDto);
    }
    async getAveragePriceByType(query) {
        return this.propertyService.getAveragePriceByType(query);
    }
    async getFilterOptions() {
        return this.propertyService.getFilterOptions();
    }
    async findAllPublic(query) {
        return this.propertyService.findAllPublic(query);
    }
    findOnePublic(guid) {
        return this.propertyService.findOnePublic(guid);
    }
    async findAll(query) {
        return this.propertyService.findAll(query);
    }
    findOne(guid) {
        return this.propertyService.findOne(guid);
    }
    update(guid, updatePropertyDto) {
        return this.propertyService.update(guid, updatePropertyDto);
    }
    remove(guid) {
        return this.propertyService.remove(guid);
    }
};
exports.PropertyController = PropertyController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'files', maxCount: 10 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_property_dto_1.CreatePropertyDto, Array]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('stats/average-price-by-type'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [property_stats_dto_1.PropertyStatsQueryDto]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "getAveragePriceByType", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('filters/options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "getFilterOptions", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_property_dto_1.FilterPropertyDto]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "findAllPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/:guid'),
    __param(0, (0, common_1.Param)('guid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertyController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_property_dto_1.FilterPropertyDto]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':guid'),
    __param(0, (0, common_1.Param)('guid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':guid'),
    __param(0, (0, common_1.Param)('guid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_property_dto_1.UpdatePropertyDTO]),
    __metadata("design:returntype", void 0)
], PropertyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':guid'),
    __param(0, (0, common_1.Param)('guid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertyController.prototype, "remove", null);
exports.PropertyController = PropertyController = __decorate([
    (0, common_1.Controller)('properties'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [property_service_1.PropertyService])
], PropertyController);
//# sourceMappingURL=property.controller.js.map