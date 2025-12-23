import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { Role } from './enums/role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index('username_search_index')
  username: string;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Exclude()
  @Column({ nullable: true })
  refreshTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLogoutTime: Date | null;

  @Exclude()
  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;
}
