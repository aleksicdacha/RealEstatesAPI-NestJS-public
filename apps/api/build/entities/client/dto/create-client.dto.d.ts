import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { CreateRepresentativeDto } from '@src/entities/representative/dto/create-representative.dto';
export declare class CreateClientDTO {
    paymentType?: PaymentType;
    transactionType?: TransactionType;
    status?: ClientStatus;
    name: string;
    address: string;
    email?: string;
    phone?: string;
    comment?: string;
    moneyAmount?: number | null;
    property?: string;
    propertyId?: string;
    ownerJmbg?: string;
    ownerBirthplace?: string;
    ownerIdCardNumber?: string;
    ownerIdCardIssuePlace?: string;
    representative?: CreateRepresentativeDto;
}
