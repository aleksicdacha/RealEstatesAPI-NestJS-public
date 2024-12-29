import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDTO} from './dto/create-client.dto';
import { UpdateClientDTO } from './dto/update-client.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Client } from '@src/entities/client/client.entity';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
  ) {}

  @Post()
  async createClient(@Body() createClientDto: CreateClientDTO): Promise<Client> {
    return this.clientService.create(createClientDto);
  }

  @Get()
  async findAll() {
    return this.clientService.findAll();
  }

  @Get(':guid')
  findOne(@Param('guid') guid: string) {
    return this.clientService.findOne(guid);
  }

  @Patch(':guid')
  update(
    @Param('guid') guid: string,
    @Body() updateClientDto: UpdateClientDTO,
  ) {
    return this.clientService.update(guid, updateClientDto);
  }

  @Delete(':guid')
  remove(@Param('guid') guid: string) {
    return this.clientService.remove(guid);
  }
}
