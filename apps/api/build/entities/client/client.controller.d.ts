import { ClientService } from './client.service';
import { CreateClientDTO } from './dto/create-client.dto';
import { UpdateClientDTO } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { Client } from '@src/entities/client/client.entity';
export declare class ClientController {
    private readonly clientService;
    constructor(clientService: ClientService);
    createClient(createClientDto: CreateClientDTO): Promise<Client>;
    findAll(filterDto: FilterClientDto): Promise<Client[]>;
    findOne(guid: string): Promise<Client>;
    update(guid: string, updateClientDto: UpdateClientDTO): Promise<Client>;
    remove(guid: string): Promise<void>;
}
