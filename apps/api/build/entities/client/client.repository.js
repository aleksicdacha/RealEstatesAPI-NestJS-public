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
exports.ClientRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const client_entity_1 = require("./client.entity");
const client_status_enum_1 = require("./enums/client-status.enum");
let ClientRepository = class ClientRepository extends typeorm_1.Repository {
    dataSource;
    constructor(dataSource) {
        super(client_entity_1.Client, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findFilteredClients(options) {
        const queryBuilder = this.createQueryBuilder('client');
        queryBuilder.leftJoinAndSelect('client.properties', 'properties');
        if (options.searchField && options.searchValue) {
            queryBuilder.andWhere(`client.${options.searchField} ILIKE :searchValue`, {
                searchValue: `%${options.searchValue}%`,
            });
        }
        if (options.status) {
            queryBuilder.andWhere('client.status = :status', { status: options.status });
        }
        queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
        queryBuilder.orderBy(`client.${options.sortBy}`, options.order);
        const [items, total] = await queryBuilder.getManyAndCount();
        return [items, total];
    }
    async softDeleteClient(id) {
        await this.createQueryBuilder()
            .update(client_entity_1.Client)
            .set({ status: client_status_enum_1.ClientStatus.Deleted })
            .where('id = :id', { id })
            .execute();
    }
};
exports.ClientRepository = ClientRepository;
exports.ClientRepository = ClientRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ClientRepository);
//# sourceMappingURL=client.repository.js.map