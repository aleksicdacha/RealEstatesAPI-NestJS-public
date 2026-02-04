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
exports.GetNewsletterSubscribersDto = exports.UnsubscribeNewsletterDto = exports.SendNewsletterDto = exports.SubscribeNewsletterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SubscribeNewsletterDto {
    email;
}
exports.SubscribeNewsletterDto = SubscribeNewsletterDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscribeNewsletterDto.prototype, "email", void 0);
class SendNewsletterDto {
    subject;
    content;
    recipients;
}
exports.SendNewsletterDto = SendNewsletterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendNewsletterDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendNewsletterDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEmail)({}, { each: true }),
    __metadata("design:type", Array)
], SendNewsletterDto.prototype, "recipients", void 0);
class UnsubscribeNewsletterDto {
    token;
}
exports.UnsubscribeNewsletterDto = UnsubscribeNewsletterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UnsubscribeNewsletterDto.prototype, "token", void 0);
class GetNewsletterSubscribersDto {
    email;
    isActive;
    subscribedFrom;
    subscribedTo;
}
exports.GetNewsletterSubscribersDto = GetNewsletterSubscribersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetNewsletterSubscribersDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === true || value === 'true' || value === '1' || value === 1 || value === 'active') {
            return true;
        }
        if (value === false || value === 'false' || value === '0' || value === 0 || value === 'inactive') {
            return false;
        }
        return undefined;
    }),
    __metadata("design:type", Boolean)
], GetNewsletterSubscribersDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], GetNewsletterSubscribersDto.prototype, "subscribedFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], GetNewsletterSubscribersDto.prototype, "subscribedTo", void 0);
//# sourceMappingURL=newsletter.dto.js.map