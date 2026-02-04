"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OptionsMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsMiddleware = void 0;
const common_1 = require("@nestjs/common");
let OptionsMiddleware = OptionsMiddleware_1 = class OptionsMiddleware {
    logger = new common_1.Logger(OptionsMiddleware_1.name);
    use(req, res, next) {
        if (req.method === 'OPTIONS') {
            this.logger.debug(`OPTIONS request to ${req.path}`);
            return res.status(200).send();
        }
        next();
    }
};
exports.OptionsMiddleware = OptionsMiddleware;
exports.OptionsMiddleware = OptionsMiddleware = OptionsMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], OptionsMiddleware);
//# sourceMappingURL=options-middleware.js.map