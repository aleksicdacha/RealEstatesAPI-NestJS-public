import { CreateClientDTO } from './dto/create-client.dto';
import { UpdateClientDTO } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { Client } from './client.entity';
import { ClientRepository } from './client.repository';
import { PropertyRepository } from '@src/entities/property/property.repository';
export declare class ClientService {
    private readonly clientRepository;
    private readonly propertyRepository;
    constructor(clientRepository: ClientRepository, propertyRepository: PropertyRepository);
    create(createClientDto: CreateClientDTO): Promise<Client>;
    update(id: string, updateClientDTO: UpdateClientDTO): Promise<Client>;
    findAll(filterDto?: FilterClientDto): Promise<Client[]>;
    findOne(id: string): Promise<Client>;
    remove(id: string): Promise<void>;
}
