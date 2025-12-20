import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientRepository } from '@src/entities/client/client.repository';
import { PropertyModule } from '@src/entities/property/property.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), PropertyModule],
  providers: [ClientService, ClientRepository],
  controllers: [ClientController],
  exports: [ClientService, ClientRepository],
})
export class ClientModule {}
