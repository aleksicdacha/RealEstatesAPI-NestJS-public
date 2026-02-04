import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterPropertyDto } from '@src/entities/property/dto/filter-property.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(query: FilterPropertyDto): Promise<import("nestjs-typeorm-paginate").Pagination<User, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    create(createUserDto: CreateUserDto): Promise<User>;
    findOne(id: number): Promise<User>;
    update(id: number, updateData: UpdateUserDto): Promise<User>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
