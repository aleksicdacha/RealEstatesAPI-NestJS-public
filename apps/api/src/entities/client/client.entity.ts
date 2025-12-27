import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from '@src/entities/property/property.entity';
import { Representative } from '@src/entities/representative/representative.entity';
import { IsPositive, Length, Matches } from 'class-validator';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';
import { TransactionType } from '@src/entities/client/enums/transaction-type.enum';
import { PaymentType } from '@src/entities/client/enums/payment-type.enum';

@Entity('clients')
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

  @Column({ type: 'text', nullable: true, unique: true })
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

  // Owner extended information (name, address, phone are already in Client base fields)
  @Column({ type: 'varchar', length: 13, nullable: true })
  @Length(13, 13, { message: 'Owner JMBG must be exactly 13 digits' })
  @Matches(/^\d{13}$/, { message: 'Owner JMBG must contain only digits' })
  ownerJmbg: string;

  @Column({ type: 'text', nullable: true })
  ownerBirthplace: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ownerIdCardNumber: string;

  @Column({ type: 'text', nullable: true })
  ownerIdCardIssuePlace: string;

  @OneToOne(() => Property, { onDelete: 'SET NULL', cascade: true, eager: true }) // `eager` ensures it is loaded automatically
  @JoinColumn() // This is required on the owning side to indicate the foreign key
  property?: Property;

  @OneToOne(() => Representative, (representative) => representative.client, { 
    cascade: true, 
    eager: true,
    nullable: true 
  })
  @JoinColumn()
  representative?: Representative;

  // Virtual property - not stored in DB, computed from relation
  propertyId?: string;
}