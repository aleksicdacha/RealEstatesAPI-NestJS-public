import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { AgentMessage } from './agent-message.entity';

export enum ConversationStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('agent_conversations')
export class AgentConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  guestName: string;

  @Column({ nullable: true })
  guestEmail: string;

  @Column({ nullable: true })
  guestPhone: string;

  @Column({ type: 'text', nullable: true })
  initialMessage: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  agentId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.WAITING,
  })
  status: ConversationStatus;

  @Column({ default: 0 })
  unreadCount: number;

  @Column({ length: 10, default: 'sr' })
  locale: string;

  @OneToMany(() => AgentMessage, (message) => message.conversation, {
    cascade: true,
  })
  messages: AgentMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
