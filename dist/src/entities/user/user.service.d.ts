import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserQueryDto } from './dto/user-query.dto';
import { I18nService } from 'nestjs-i18n';
export declare class UserService {
    private readonly userRepository;
    private readonly i18n;
    constructor(userRepository: UserRepository, i18n: I18nService);
    findAll(options: UserQueryDto, filters?: {
        [key: string]: any;
    }): Promise<Pagination<User>>;
    findOne(id: number): Promise<any>;
    create(createUserDto: CreateUserDto): Promise<any>;
    updateUser(id: number, updateData: Partial<User>): Promise<User>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
    findByUsername(username: string): Promise<User>;
    validateUser(username: string, pass: string): Promise<any>;
    setRefreshToken(userId: number, refreshToken: string): Promise<void>;
    validateRefreshToken(userId: number, refreshToken: string): Promise<boolean>;
    updateRefreshToken(userId: number, refreshToken: string): Promise<void>;
    clearRefreshToken(userId: number): Promise<void>;
    updateLastLogoutTime(userId: number): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
    createPasswordResetToken(userId: number): Promise<string>;
    findByResetToken(token: string): Promise<User | null>;
    resetPassword(userId: number, newPassword: string): Promise<void>;
}
