import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER, // Default role is "user"
  })
  role: Role;
}
