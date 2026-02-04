"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyImageModule = void 0;
const common_1 = require("@nestjs/common");
const property_image_service_1 = require("./property-image.service");
const property_image_controller_1 = require("./property-image.controller");
const property_image_repository_1 = require("./property-image.repository");
const typeorm_1 = require("@nestjs/typeorm");
const property_image_entity_1 = require("./property-image.entity");
let PropertyImageModule = class PropertyImageModule {
};
exports.PropertyImageModule = PropertyImageModule;
exports.PropertyImageModule = PropertyImageModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([property_image_entity_1.PropertyImage])],
        providers: [property_image_service_1.PropertyImageService, property_image_repository_1.PropertyImageRepository],
        controllers: [property_image_controller_1.PropertyImageController]
    })
], PropertyImageModule);
//# sourceMappingURL=property-image.module.js.map