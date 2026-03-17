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
exports.UserQueryDto = exports.FiltersDto = void 0;
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../common/config/constants");
const search_field_validator_1 = require("../../../common/validators/search-field.validator");
const class_transformer_1 = require("class-transformer");
const nestjs_i18n_1 = require("nestjs-i18n");
class FiltersDto {
    role;
    username;
}
exports.FiltersDto = FiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltersDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltersDto.prototype, "username", void 0);
class UserQueryDto {
    searchValue;
    searchField;
    order;
    sortBy;
    page;
    limit;
    filters;
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.search.minLength', { min: 3 }) }),
    __metadata("design:type", String)
], UserQueryDto.prototype, "searchValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, search_field_validator_1.IsValidSearchField)(constants_1.VALID_SEARCH_FIELDS, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.search.invalidField') }),
    __metadata("design:type", String)
], UserQueryDto.prototype, "searchField", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], UserQueryDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['username', 'role']),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.pagination.pagePositive') }),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.pagination.limitPositive') }),
    (0, class_validator_1.Max)(100, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.pagination.limitMax', { max: 100 }) }),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "filters", void 0);
//# sourceMappingURL=user-query.dto.js.map