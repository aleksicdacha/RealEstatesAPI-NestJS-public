import { DataSource, Repository } from 'typeorm';
import { Client } from './client.entity';
export declare class ClientRepository extends Repository<Client> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findFilteredClients(options: any): Promise<[Client[], number]>;
    softDeleteClient(id: string): Promise<void>;
}
