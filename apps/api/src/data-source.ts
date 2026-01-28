import { DataSource } from 'typeorm';
import { User } from './entities/user/user.entity';
import { Property } from './entities/property/property.entity';
import { PropertyImage } from './entities/property-image/property-image.entity';
import { Client } from './entities/client/client.entity';
import { Representative } from './entities/representative/representative.entity';
import { AgentConversation } from './entities/agent-chat/agent-conversation.entity';
import { AgentMessage } from './entities/agent-chat/agent-message.entity';
import { NewsletterSubscriber } from './entities/newsletter-subscriber/newsletter-subscriber.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'CHANGE_ME',
  database: process.env.DB_NAME || 'estates',
  synchronize: false,
  logging: true,
  entities: [User, Property, PropertyImage, Client, Representative, AgentConversation, AgentMessage, NewsletterSubscriber],
  migrations: [__dirname + '/migrations/*.js'],
});