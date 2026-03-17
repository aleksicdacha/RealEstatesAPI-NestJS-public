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
exports.Representative = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../client/client.entity");
const class_validator_1 = require("class-validator");
let Representative = class Representative {
    id;
    name;
    address;
    phone;
    jmbg;
    birthplace;
    idCardNumber;
    idCardIssuePlace;
    createdAt;
    updatedAt;
    client;
};
exports.Representative = Representative;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Representative.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representative.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representative.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representative.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 13, nullable: true }),
    (0, class_validator_1.Length)(13, 13, { message: 'JMBG must be exactly 13 digits' }),
    (0, class_validator_1.Matches)(/^\d{13}$/, { message: 'JMBG must contain only digits' }),
    __metadata("design:type", String)
], Representative.prototype, "jmbg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representative.prototype, "birthplace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Representative.prototype, "idCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representative.prototype, "idCardIssuePlace", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Representative.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Representative.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => client_entity_1.Client, (client) => client.representative),
    __metadata("design:type", client_entity_1.Client)
], Representative.prototype, "client", void 0);
exports.Representative = Representative = __decorate([
    (0, typeorm_1.Entity)('representatives')
], Representative);
//# sourceMappingURL=representative.entity.js.map