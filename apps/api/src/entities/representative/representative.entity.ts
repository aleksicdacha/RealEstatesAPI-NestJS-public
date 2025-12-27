import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '@src/entities/client/client.entity';
import { Length, Matches } from 'class-validator';

@Entity('representatives')
export class Representative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 13, nullable: true })
  @Length(13, 13, { message: 'JMBG must be exactly 13 digits' })
  @Matches(/^\d{13}$/, { message: 'JMBG must contain only digits' })
  jmbg: string;

  @Column({ type: 'text', nullable: true })
  birthplace: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  idCardNumber: string;

  @Column({ type: 'text', nullable: true })
  idCardIssuePlace: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Client, (client) => client.representative)
  client: Client;
}
