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
exports.CreateClientDTO = void 0;
const class_validator_1 = require("class-validator");
const payment_type_enum_1 = require("../enums/payment-type.enum");
const transaction_type_enum_1 = require("../enums/transaction-type.enum");
const client_status_enum_1 = require("../enums/client-status.enum");
class CreateClientDTO {
    paymentType;
    transactionType;
    status;
    name;
    address;
    email;
    phone;
    comment;
    moneyAmount;
    property;
    propertyId;
}
exports.CreateClientDTO = CreateClientDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payment_type_enum_1.PaymentType, { message: 'Payment type must be one of the valid enum values: cash, credit, combined.' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "paymentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(transaction_type_enum_1.TransactionType, { message: 'Transaction type must be one of the valid enum values: seller, buyer, rents, rents-out.' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "transactionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_status_enum_1.ClientStatus, { message: 'Status must be one of the valid enum values: active, inactive, deleted.' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Name must be a string.' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Address must be a string.' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Email must be a valid email address.' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Phone number must be a string.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Comment must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Comment must not exceed 500 characters' }),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateClientDTO.prototype, "moneyAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "property", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClientDTO.prototype, "propertyId", void 0);
//# sourceMappingURL=create-client.dto.js.map