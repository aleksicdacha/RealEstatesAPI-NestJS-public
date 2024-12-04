import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(
    options: UserQueryDto,
    filters?: { [p: string]: any },
  ): Promise<Pagination<User>> {

    // Convert page and limit to numbers, use defaults if not provided
    const page = options.page ? Number(options.page) : 1;  // Default to 1 if not provided
    const limit = options.limit ? Math.min(Number(options.limit), 100) : 10;  // Default to 10, max 100

    // Log values to inspect
    console.log('Page:', page, 'Limit:', limit);

    // Validate page and limit
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      throw new BadRequestException('Page and limit must be valid positive numbers.');
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryBuilder.andWhere(`user.${key} = :${key}`, { [key]: value });
        }
      });
    }

    // Apply search if provided
    if (options.searchField && options.searchValue && options.searchValue.length >= 3) {
      console.log(`Searching in field: ${options.searchField} for value: ${options.searchValue}`);
      // Use ILIKE for case-insensitive search (works with PostgreSQL)
      queryBuilder.andWhere(`user.${options.searchField} ILIKE :searchValue`, {
        searchValue: `%${options.searchValue}%`,
      });
    }

    // Apply sorting if provided
    if (options.sortBy && options.order) {
      queryBuilder.orderBy(`user.${options.sortBy}`, options.order);
    }

    // Apply pagination
    try {
      // Validate skip and take are valid numbers before calling
      queryBuilder.skip((page - 1) * limit).take(limit);

      // Get the total number of items and apply pagination
      const totalItems = await queryBuilder.getCount();
      const items = await queryBuilder.getMany();

      return new Pagination<User>(
        items,
        {
          totalItems,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
        },
      );
    } catch (err) {
      console.error('Error while applying pagination', err);
      throw new BadRequestException('Error while applying pagination');
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateData.password) {
      // Hash password if it's being updated
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    await this.userRepository.update(id, updateData); // Partial update
    return this.userRepository.findOneBy({ id }); // Return the updated user
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `User with ID ${id} deleted successfully` };
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    console.log('Validate user fired !!!!');
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      console.log(`User with username ${username} not found.`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    console.log(`Password comparison result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshTokenHash: hashedToken });
  }

  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !user.refreshTokenHash) return false;

    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedToken = await bcrypt.hash(refreshToken, salt);

    await this.userRepository.update(userId, { refreshTokenHash: hashedToken });
  }

  async clearRefreshToken(userId: number) {
    if (!userId) {
      throw new Error('User ID is required for clearing refresh token');
    }

    await this.userRepository.update({ id: userId }, { refreshTokenHash: null });
  }

  async updateLastLogoutTime(userId: number): Promise<void> {
    await this.userRepository.update(userId, { lastLogoutTime: new Date() });
  }

}
