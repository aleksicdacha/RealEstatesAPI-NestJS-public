import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterPropertyDto } from '@src/entities/property/dto/filter-property.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(query: FilterPropertyDto): Promise<Pagination<User>>;
    create(createUserDto: CreateUserDto): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateData: UpdateUserDto): Promise<User>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
