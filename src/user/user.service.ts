import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async findAll() {
    return this.userRepository.find();
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
