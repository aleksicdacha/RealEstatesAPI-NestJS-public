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
var ClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const client_repository_1 = require("./client.repository");
const property_repository_1 = require("../property/property.repository");
const typeorm_1 = require("typeorm");
let ClientService = ClientService_1 = class ClientService {
    clientRepository;
    propertyRepository;
    logger = new common_1.Logger(ClientService_1.name);
    constructor(clientRepository, propertyRepository) {
        this.clientRepository = clientRepository;
        this.propertyRepository = propertyRepository;
    }
    async create(createClientDto) {
        const { property: propertyId, propertyId: propId, ...clientData } = createClientDto;
        const finalPropertyId = propertyId || propId;
        let property = null;
        if (finalPropertyId) {
            property = await this.propertyRepository.findOne({ where: { id: finalPropertyId } });
            if (!property) {
                throw new common_1.NotFoundException(`Property with ID ${finalPropertyId} not found`);
            }
        }
        const client = this.clientRepository.create({
            ...clientData,
            property,
        });
        const savedClient = await this.clientRepository.save(client);
        if (savedClient.property) {
            savedClient.propertyId = savedClient.property.id;
        }
        return savedClient;
    }
    async update(id, updateClientDTO) {
        this.logger.debug(`Updating client ${id}`);
        const { email, phone, propertyId, ...clientData } = updateClientDTO;
        if (updateClientDTO.transactionType && !['seller', 'buyer', 'rents', 'rents-out'].includes(updateClientDTO.transactionType)) {
            throw new Error(`Invalid transactionType: ${updateClientDTO.transactionType}`);
        }
        const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
        if (!client) {
            throw new common_1.NotFoundException(`Client with id "${id}" not found.`);
        }
        if (email && email !== client.email) {
            const existingClient = await this.clientRepository.findOne({ where: { email } });
            if (existingClient) {
                throw new common_1.ConflictException(`Client with email "${email}" already exists.`);
            }
        }
        if (phone && phone !== client.phone) {
            const existingClient = await this.clientRepository.findOne({ where: { phone } });
            if (existingClient) {
                throw new common_1.ConflictException(`Client with phone "${phone}" already exists.`);
            }
        }
        let property = null;
        if (propertyId !== undefined) {
            if (propertyId === null) {
                property = null;
            }
            else {
                property = await this.propertyRepository.findOne({ where: { id: propertyId } });
                if (!property) {
                    throw new common_1.NotFoundException(`Property with ID ${propertyId} not found`);
                }
            }
            client.property = property;
        }
        Object.assign(client, { email, phone, ...clientData });
        await this.clientRepository.save(client);
        const updatedClient = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
        if (updatedClient?.property) {
            updatedClient.propertyId = updatedClient.property.id;
        }
        return updatedClient;
    }
    async findAll(filterDto) {
        const where = {};
        if (filterDto?.hasProperty !== undefined) {
            if (filterDto.hasProperty === false) {
                where.property = (0, typeorm_1.IsNull)();
            }
            else {
                where.property = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
            }
        }
        const clients = await this.clientRepository.find({
            where,
            relations: ['property']
        });
        clients.forEach(client => {
            if (client.property) {
                client.propertyId = client.property.id;
            }
        });
        return clients;
    }
    async findOne(id) {
        const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${id} not found`);
        }
        if (client.property) {
            client.propertyId = client.property.id;
        }
        return client;
    }
    async remove(id) {
        const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${id} not found.`);
        }
        if (client.property) {
            client.property = null;
            await this.clientRepository.save(client);
        }
        await this.clientRepository.remove(client);
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = ClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_repository_1.ClientRepository,
        property_repository_1.PropertyRepository])
], ClientService);
//# sourceMappingURL=client.service.js.map