import { Client } from '@src/entities/client/client.entity';
export declare class Representative {
    id: string;
    name: string;
    address: string;
    phone: string;
    jmbg: string;
    birthplace: string;
    idCardNumber: string;
    idCardIssuePlace: string;
    createdAt: Date;
    updatedAt: Date;
    client: Client;
}
