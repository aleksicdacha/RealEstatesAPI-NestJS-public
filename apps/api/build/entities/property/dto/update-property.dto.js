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
exports.UpdatePropertyDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const update_propertyImage_dto_1 = require("../../property-image/dto/update-propertyImage.dto");
const is_immutable_validator_1 = require("../../../common/validators/is-immutable.validator");
const heating_enum_1 = require("../enums/heating.enum");
const property_type_enum_1 = require("../enums/property-type.enum");
const property_status_enum_1 = require("../enums/property-status.enum");
class UpdatePropertyDTO {
    code;
    name;
    description;
    propertyType;
    status;
    price;
    salePrice;
    area;
    lat;
    lon;
    comment;
    additionalEquipment;
    elevator;
    address;
    neighborhood;
    constructionYear;
    bathrooms;
    floor;
    heating;
    images;
}
exports.UpdatePropertyDTO = UpdatePropertyDTO;
__decorate([
    (0, is_immutable_validator_1.IsImmutable)({ message: 'Code cannot be updated once created.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Code must be at least 3 characters long.' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Code must not exceed 20 characters.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Name must not exceed 255 characters.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Description must not exceed 1000 characters.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_type_enum_1.PropertyType, { message: 'Invalid property type.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "propertyType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(property_status_enum_1.PropertyStatus, { message: 'Invalid property status.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ allowInfinity: false, allowNaN: false }, { message: 'Price must be a valid number.' }),
    (0, class_validator_1.Min)(0, { message: 'Price cannot be less than 0.' }),
    (0, class_validator_1.Max)(1_000_000_000, { message: 'Price cannot exceed 1 billion.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ allowInfinity: false, allowNaN: false }, { message: 'Sale price must be a valid number.' }),
    (0, class_validator_1.Min)(0, { message: 'Sale price cannot be less than 0.' }),
    (0, class_validator_1.Max)(1_000_000_000, { message: 'Sale price cannot exceed 1 billion.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "salePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ allowInfinity: false, allowNaN: false }, { message: 'Area must be a valid number.' }),
    (0, class_validator_1.Min)(1, { message: 'Area must be at least 1 square meter.' }),
    (0, class_validator_1.Max)(100_000, { message: 'Area cannot exceed 100,000 square meters.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ allowInfinity: false, allowNaN: false }, { message: 'Latitude must be a valid number.' }),
    (0, class_validator_1.Min)(-90, { message: 'Latitude cannot be less than -90.' }),
    (0, class_validator_1.Max)(90, { message: 'Latitude cannot exceed 90.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ allowInfinity: false, allowNaN: false }, { message: 'Longitude must be a valid number.' }),
    (0, class_validator_1.Min)(-180, { message: 'Longitude cannot be less than -180.' }),
    (0, class_validator_1.Max)(180, { message: 'Longitude cannot exceed 180.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "lon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Comment must be a string.' }),
    (0, class_validator_1.MinLength)(10, { message: 'Comment must be at least 10 characters long.' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Comment must not exceed 500 characters.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Additional equipment must be an array of strings.' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each additional equipment item must be a string.' }),
    __metadata("design:type", Array)
], UpdatePropertyDTO.prototype, "additionalEquipment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Elevator must be a boolean value.' }),
    __metadata("design:type", Boolean)
], UpdatePropertyDTO.prototype, "elevator", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Address must not exceed 255 characters.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Neighborhood must be a string.' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Neighborhood must not exceed 255 characters.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "neighborhood", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Construction year must be an integer.' }),
    (0, class_validator_1.Min)(1900, { message: 'Construction year must be no earlier than 1900.' }),
    (0, class_validator_1.Max)(new Date().getFullYear(), {
        message: 'Construction year cannot be in the future.',
    }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "constructionYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ allowInfinity: false, allowNaN: false }, { message: 'Bathrooms must be a valid number.' }),
    (0, class_validator_1.Min)(0, { message: 'Bathrooms cannot be less than 0.' }),
    (0, class_validator_1.Max)(50, { message: 'Bathrooms cannot exceed 50.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "bathrooms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Floor must be an integer value.' }),
    (0, class_validator_1.Min)(-5, { message: 'Floor cannot be lower than -5 (e.g., basements).' }),
    (0, class_validator_1.Max)(200, { message: 'Floor cannot exceed 200.' }),
    __metadata("design:type", Number)
], UpdatePropertyDTO.prototype, "floor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(heating_enum_1.HeatingType, { message: 'Invalid heating type.' }),
    __metadata("design:type", String)
], UpdatePropertyDTO.prototype, "heating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Images must be an array of objects.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => update_propertyImage_dto_1.UpdatePropertyImageDto),
    __metadata("design:type", Array)
], UpdatePropertyDTO.prototype, "images", void 0);
//# sourceMappingURL=update-property.dto.js.map