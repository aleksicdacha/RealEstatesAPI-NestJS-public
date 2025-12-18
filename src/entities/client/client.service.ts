import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDTO } from './dto/create-client.dto';
import { UpdateClientDTO } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { Client } from './client.entity';
import { ClientRepository } from './client.repository';
import { PropertyRepository } from '@src/entities/property/property.repository';
import { Property } from '@src/entities/property/property.entity';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async create(createClientDto: CreateClientDTO): Promise<Client> {
    const { property: propertyId, ...clientData } = createClientDto;

    let property: Property | null = null;

    // If a property ID is provided, validate and fetch the property
    if (propertyId) {
      property = await this.propertyRepository.findOne({ where: { id: propertyId } });

      if (!property) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }
    }

    const client = this.clientRepository.create({
      ...clientData,
      property, // Directly assign the property entity (not just the ID)
    });

    return this.clientRepository.save(client);
  }

  async update(id: string, updateClientDTO: UpdateClientDTO): Promise<Client> {
    const { email, phone, ...clientData } = updateClientDTO;

    // Find the client to update
    const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
    if (!client) {
      throw new NotFoundException(`Client with id "${id}" not found.`);
    }

    // Check for conflicts with email or phone
    if (email && email !== client.email) {
      const existingClient = await this.clientRepository.findOne({ where: { email } });
      if (existingClient) {
        throw new ConflictException(`Client with email "${email}" already exists.`);
      }
    }

    if (phone && phone !== client.phone) {
      const existingClient = await this.clientRepository.findOne({ where: { phone } });
      if (existingClient) {
        throw new ConflictException(`Client with phone "${phone}" already exists.`);
      }
    }

    // Update the client fields
    await this.clientRepository.update(id, { email, phone, ...clientData });

    // Fetch and return the updated client
    return await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
  }

  async findAll(filterDto?: FilterClientDto): Promise<Client[]> {
    const where: any = {};

    // Filter by hasProperty if specified
    if (filterDto?.hasProperty !== undefined) {
      if (filterDto.hasProperty === false) {
        where.property = IsNull();
      } else {
        where.property = Not(IsNull());
      }
    }

    return await this.clientRepository.find({ 
      where,
      relations: ['property'] 
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async remove(id: string): Promise<void> {
    const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found.`);
    }

    // Disassociate the property if one exists
    if (client.property) {
      client.property = null;
      await this.clientRepository.save(client);
    }

    await this.clientRepository.remove(client);
  }
}
