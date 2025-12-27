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
exports.Client = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../property/property.entity");
const representative_entity_1 = require("../representative/representative.entity");
const class_validator_1 = require("class-validator");
const client_status_enum_1 = require("./enums/client-status.enum");
const transaction_type_enum_1 = require("./enums/transaction-type.enum");
const payment_type_enum_1 = require("./enums/payment-type.enum");
let Client = class Client {
    id;
    status;
    name;
    address;
    email;
    phone;
    transactionType;
    paymentType;
    comment;
    moneyAmount;
    ownerJmbg;
    ownerBirthplace;
    ownerIdCardNumber;
    ownerIdCardIssuePlace;
    property;
    representative;
    propertyId;
};
exports.Client = Client;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Client.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: client_status_enum_1.ClientStatus,
        default: client_status_enum_1.ClientStatus.Active
    }),
    __metadata("design:type", String)
], Client.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Client.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Client.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Client.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: transaction_type_enum_1.TransactionType,
        default: transaction_type_enum_1.TransactionType.Seller
    }),
    __metadata("design:type", String)
], Client.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payment_type_enum_1.PaymentType,
        default: payment_type_enum_1.PaymentType.Cash
    }),
    __metadata("design:type", String)
], Client.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 0, nullable: true }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], Client.prototype, "moneyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 13, nullable: true }),
    (0, class_validator_1.Length)(13, 13, { message: 'Owner JMBG must be exactly 13 digits' }),
    (0, class_validator_1.Matches)(/^\d{13}$/, { message: 'Owner JMBG must contain only digits' }),
    __metadata("design:type", String)
], Client.prototype, "ownerJmbg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "ownerBirthplace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "ownerIdCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "ownerIdCardIssuePlace", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => property_entity_1.Property, { onDelete: 'SET NULL', cascade: true, eager: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", property_entity_1.Property)
], Client.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => representative_entity_1.Representative, (representative) => representative.client, {
        cascade: true,
        eager: true,
        nullable: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", representative_entity_1.Representative)
], Client.prototype, "representative", void 0);
exports.Client = Client = __decorate([
    (0, typeorm_1.Entity)('clients')
], Client);
//# sourceMappingURL=client.entity.js.map