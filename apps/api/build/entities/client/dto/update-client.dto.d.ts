import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { UpdateRepresentativeDto } from '@src/entities/representative/dto/update-representative.dto';
export declare class UpdateClientDTO {
    paymentType?: PaymentType;
    transactionType?: TransactionType;
    status?: ClientStatus;
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    comment?: string;
    moneyAmount?: number;
    propertyId?: string | null;
    ownerJmbg?: string;
    ownerBirthplace?: string;
    ownerIdCardNumber?: string;
    ownerIdCardIssuePlace?: string;
    representative?: UpdateRepresentativeDto;
}
