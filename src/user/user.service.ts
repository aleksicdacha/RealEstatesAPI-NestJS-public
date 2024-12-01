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

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  // async validateUser(username: string, password: string): Promise<any> {
  //   const user = await this.userRepository.findOneBy({ username });
  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

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

}
