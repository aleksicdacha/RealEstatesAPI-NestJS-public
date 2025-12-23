import { Property } from '@src/entities/property/property.entity';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';
export declare class Client {
    id: string;
    status: ClientStatus;
    name: string;
    address: string;
    email: string;
    phone: string;
    transactionType: TransactionType;
    paymentType: PaymentType;
    comment: string | null;
    moneyAmount: number;
    property?: Property;
    propertyId?: string;
}
