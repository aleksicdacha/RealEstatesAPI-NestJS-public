import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn, Unique, OneToOne,
} from 'typeorm';
import { PropertyImage } from '@src/entities/property-image/property-image.entity';
import { IsPositive } from 'class-validator';
import { Client } from '@src/entities/client/client.entity';
import { HeatingType } from '@src/entities/property/enums/heating.enum';
import { PropertyType } from '@src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '@src/entities/property/enums/property-status.enum';

@Entity('properties')
@Unique(['code'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.Apartment, // Optional: set a default value
  })
  propertyType: PropertyType;  // Use the enum type

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.Active
  })
  status: PropertyStatus;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  @IsPositive()
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  @IsPositive()
  salePrice: number;

  @Column({ type: 'float', nullable: true  })
  area?: number;

  @Column()
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  neighborhood?: string; // District/area name (e.g., "Duvanjište", "Centar")

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lon: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', nullable: true })
  elevator: boolean;

  @Column({ type: 'jsonb', nullable: true })
  additionalEquipment: string[];

  @Column({ type: 'int', nullable: true })
  constructionYear?: number;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  @Column({ type: 'int', nullable: true })
  floor?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  roomStructure?: string; // Room structure: garsonjera, jednosoban, dvosoban, trosoban, etc.

  @Column({ type: 'enum', enum: HeatingType, nullable: true })
  heating?: HeatingType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PropertyImage, (image) => image.property, { cascade: true, eager: true })
  images?: PropertyImage[];

  // Optional: Bi-directional relation with Client
  @OneToOne(() => Client, (client) => client.property, { nullable: true })
  client: Client;
}
