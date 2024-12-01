import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Import bcrypt for password hashing and comparison

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // This method will be used to validate the user during login
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username: username } as FindOptionsWhere<User>, // Explicitly casting to FindOptionsWhere<User>
    });

    if (!user) {
      // If user not found, throw a NotFoundException with a descriptive message
      throw new NotFoundException(`User with username ${username} not found`);
    }

    // Compare the plain password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // If the password is incorrect, throw an UnauthorizedException
      throw new UnauthorizedException('Invalid credentials');
    }

    return user; // If the password is correct, return the user object
  }

  // Other UserService methods for managing users, like create, findOne, etc.
  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt); // Hash the password

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword, // Store the hashed password
      role: createUserDto.role,
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // Method to find user by username
  async findByUsername(username: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { username: username } as FindOptionsWhere<User>, // Explicitly casting to FindOptionsWhere<User>
    });
  }
}
