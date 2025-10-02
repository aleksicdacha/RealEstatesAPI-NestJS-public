import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Client } from './client.entity';
import { ClientStatus } from '@src/entities/client/enums/client-status.enum';


@Injectable()
export class ClientRepository extends Repository<Client> {
  constructor(private readonly dataSource: DataSource) {
    super(Client, dataSource.createEntityManager());
  }

  async findFilteredClients(options: any): Promise<[Client[], number]> {
    const queryBuilder = this.createQueryBuilder('client');
    queryBuilder.leftJoinAndSelect('client.properties', 'properties');

    if (options.searchField && options.searchValue) {
      queryBuilder.andWhere(`client.${options.searchField} ILIKE :searchValue`, {
        searchValue: `%${options.searchValue}%`,
      });
    }

    if (options.status) {
      queryBuilder.andWhere('client.status = :status', { status: options.status });
    }

    queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
    queryBuilder.orderBy(`client.${options.sortBy}`, options.order as 'ASC' | 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();
    return [items, total];
  }

  async softDeleteClient(id: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Client)
      .set({ status: ClientStatus.Deleted })
      .where('id = :id', { id })
      .execute();
  }

}