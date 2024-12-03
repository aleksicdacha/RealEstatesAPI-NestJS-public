import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from './enums/role.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

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
}
