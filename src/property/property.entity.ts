import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { PropertyImage } from '../property-image/property-image.entity';
import { IsPositive } from 'class-validator';

export enum PropertyType {
  Apartment = 'Apartment',
  House = 'House',
  Office = 'Office',
}

export enum PropertyStatus {
  Active = 'active',
  Inactive = 'inactive',
  Deleted = 'deleted',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column({ unique: true })
  // @Generated('uuid')
  // guid: string;

  @Column()
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

  @Column({ type: 'float' })
  area: number;

  @Column()
  address: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lon: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', nullable: false })
  elevator: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => PropertyImage, (image) => image.property, { cascade: true })
  // images: PropertyImage[];

  @OneToMany(() => PropertyImage, (image) => image.property)
  images: PropertyImage[];
}
