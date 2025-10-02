import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from '@src/entities/property/property.entity';
import { IsPositive } from 'class-validator';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.Active
  })
  status: ClientStatus;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.Seller
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.Cash
  })
  paymentType: PaymentType;

  @Column({ type: 'text', nullable: true })
  comment: string|null;

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  @IsPositive()
  moneyAmount: number;

  @OneToOne(() => Property, { onDelete: 'SET NULL', cascade: true, eager: true }) // `eager` ensures it is loaded automatically
  @JoinColumn() // This is required on the owning side to indicate the foreign key
  property?: Property;
}