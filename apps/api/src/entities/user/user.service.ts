import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserQueryDto } from './dto/user-query.dto';
import { QueryBuilderHelper } from '@src/common/query-builder.helper';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(options: UserQueryDto, filters?: { [key: string]: any }): Promise<Pagination<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user'); // Use 'user' as alias

    // Apply common query options
    QueryBuilderHelper.applyQueryOptions(queryBuilder, options, filters);

    // Get results with pagination
    const totalItems = await queryBuilder.getCount();
    const items = await queryBuilder.getMany();

    return new Pagination<User>(items, {
      totalItems,
      itemCount: items.length,
      itemsPerPage: options.limit || 10,
      totalPages: Math.ceil(totalItems / (options.limit || 10)),
      currentPage: options.page || 1,
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('errors.user.notFound', { lang: I18nContext.current().lang })
      );
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      console.log('[UserService] Creating user:', createUserDto);
      console.log('[UserService] About to generate salt...');
      const salt = await bcrypt.genSalt();
      console.log('[UserService] Salt generated successfully');
      console.log('[UserService] About to hash password...');
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      console.log('[UserService] Password hashed successfully');

      console.log('[UserService] About to create user entity...');
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      console.log('[UserService] User entity created:', user);

      console.log('[UserService] About to save user to database...');
      const savedUser = await this.userRepository.save(user);
      console.log('[UserService] User saved to database successfully:', savedUser);
      return savedUser;
    } catch (error) {
      console.error('[UserService] Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('errors.user.notFound', { lang: I18nContext.current().lang })
      );
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
      throw new NotFoundException(
        this.i18n.t('errors.user.notFound', { lang: I18nContext.current().lang })
      );
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createPasswordResetToken(userId: number): Promise<string> {
    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Token expires in 1 hour
    const resetPasswordExpires = new Date(Date.now() + 3600000);
    
    await this.userRepository.update(userId, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    });
    
    return resetToken; // Return the plain token to send via email
  }

  async findByResetToken(token: string): Promise<User | null> {
    // Find all users with non-expired reset tokens
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken IS NOT NULL')
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getMany();
    
    // Check each user's hashed token against the provided token
    for (const user of users) {
      const isValid = await bcrypt.compare(token, user.resetPasswordToken);
      if (isValid) {
        return user;
      }
    }
    
    return null;
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await this.userRepository.update(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

}
