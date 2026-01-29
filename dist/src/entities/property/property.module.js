"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyModule = void 0;
const common_1 = require("@nestjs/common");
const property_service_1 = require("./property.service");
const property_controller_1 = require("./property.controller");
const typeorm_1 = require("@nestjs/typeorm");
const property_entity_1 = require("./property.entity");
const property_image_entity_1 = require("../property-image/property-image.entity");
const upload_module_1 = require("../upload/upload.module");
const property_repository_1 = require("./property.repository");
const property_image_repository_1 = require("../property-image/property-image.repository");
let PropertyModule = class PropertyModule {
};
exports.PropertyModule = PropertyModule;
exports.PropertyModule = PropertyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([property_entity_1.Property, property_image_entity_1.PropertyImage]), upload_module_1.UploadModule],
        providers: [property_service_1.PropertyService, property_repository_1.PropertyRepository, property_image_repository_1.PropertyImageRepository],
        controllers: [property_controller_1.PropertyController],
        exports: [property_service_1.PropertyService, property_repository_1.PropertyRepository, property_image_repository_1.PropertyImageRepository],
    })
], PropertyModule);
//# sourceMappingURL=property.module.js.map