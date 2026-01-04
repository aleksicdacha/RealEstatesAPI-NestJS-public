import { ConflictException, Injectable, NotFoundException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ClientService.name);

  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async create(createClientDto: CreateClientDTO): Promise<Client> {
    const { property: propertyId, propertyId: propId, ...clientData } = createClientDto;
    const finalPropertyId = propertyId || propId;

    let property: Property | null = null;

    // If a property ID is provided, validate and fetch the property
    if (finalPropertyId) {
      property = await this.propertyRepository.findOne({ where: { id: finalPropertyId } });

      if (!property) {
        throw new NotFoundException(`Property with ID ${finalPropertyId} not found`);
      }
    }

    const client = this.clientRepository.create({
      ...clientData,
      property, // Directly assign the property entity (not just the ID)
    });

    const savedClient = await this.clientRepository.save(client);
    
    // Populate virtual propertyId field
    if (savedClient.property) {
      savedClient.propertyId = savedClient.property.id;
    }
    
    return savedClient;
  }

  async update(id: string, updateClientDTO: UpdateClientDTO): Promise<Client> {
    this.logger.debug(`Updating client ${id}`);
    const { email, phone, propertyId, ...clientData } = updateClientDTO;
    if (updateClientDTO.transactionType && !['seller','buyer','rents','rents-out'].includes(updateClientDTO.transactionType)) {
      throw new Error(`Invalid transactionType: ${updateClientDTO.transactionType}`);
    }

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

    // Handle propertyId update
    let property: Property | null = null;
    if (propertyId !== undefined) {
      if (propertyId === null) {
        // Remove property link
        property = null;
      } else {
        // Link to new property
        property = await this.propertyRepository.findOne({ where: { id: propertyId } });
        if (!property) {
          throw new NotFoundException(`Property with ID ${propertyId} not found`);
        }
      }
      client.property = property;
    }

    // Update the client fields
    Object.assign(client, { email, phone, ...clientData });
    await this.clientRepository.save(client);

    // Fetch and return the updated client
    const updatedClient = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
    
    // Populate virtual propertyId field
    if (updatedClient?.property) {
      updatedClient.propertyId = updatedClient.property.id;
    }
    
    return updatedClient;
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

    const clients = await this.clientRepository.find({ 
      where,
      relations: ['property'] 
    });
    
    // Populate virtual propertyId field for each client
    clients.forEach(client => {
      if (client.property) {
        client.propertyId = client.property.id;
      }
    });
    
    return clients;
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id }, relations: ['property'] });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    // Populate virtual propertyId field
    if (client.property) {
      client.propertyId = client.property.id;
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
