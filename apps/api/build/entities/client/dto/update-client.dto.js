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
exports.UpdateClientDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const payment_type_enum_1 = require("../enums/payment-type.enum");
const transaction_type_enum_1 = require("../enums/transaction-type.enum");
const client_status_enum_1 = require("../enums/client-status.enum");
const nestjs_i18n_1 = require("nestjs-i18n");
const update_representative_dto_1 = require("../../representative/dto/update-representative.dto");
class UpdateClientDTO {
    paymentType;
    transactionType;
    status;
    name;
    address;
    email;
    phone;
    comment;
    moneyAmount;
    propertyId;
    ownerJmbg;
    ownerBirthplace;
    ownerIdCardNumber;
    ownerIdCardIssuePlace;
    representative;
}
exports.UpdateClientDTO = UpdateClientDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payment_type_enum_1.PaymentType, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.client.paymentTypeInvalid') }),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "paymentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_type_enum_1.TransactionType, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.client.transactionTypeInvalid') }),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "transactionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_status_enum_1.ClientStatus, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.client.statusInvalid') }),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.client.emailInvalid') }),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateClientDTO.prototype, "moneyAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "propertyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(13, 13, { message: 'JMBG must be exactly 13 digits.' }),
    (0, class_validator_1.Matches)(/^\d{13}$/, { message: 'JMBG must contain only digits.' }),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "ownerJmbg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "ownerBirthplace", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "ownerIdCardNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateClientDTO.prototype, "ownerIdCardIssuePlace", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => update_representative_dto_1.UpdateRepresentativeDto),
    __metadata("design:type", update_representative_dto_1.UpdateRepresentativeDto)
], UpdateClientDTO.prototype, "representative", void 0);
//# sourceMappingURL=update-client.dto.js.map