import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn, Generated,
} from 'typeorm';
import { PropertyImage } from '../property-image.entity/property-image.entity';

export enum PropertyType {
  Apartment = 'Apartment',
  House = 'House',
  Office = 'Office',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.Apartment, // Optional: set a default value
  })
  propertyType: PropertyType;  // Use the enum type

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'float' })
  area: number;

  @Column()
  address: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lon: number;

  @Column({ unique: true })
  @Generated('uuid')
  guid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PropertyImage, (image) => image.property, { cascade: true })
  images: PropertyImage[];
}
