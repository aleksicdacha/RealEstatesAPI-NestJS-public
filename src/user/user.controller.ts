import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './enums/role.enum';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { SortOptions } from '../common/interfaces/sort-options.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('username') username?: string, // Filtering by username
    @Query('role') role?: string, // Filtering by role
    @Query('sortBy') sortBy: string = 'id', // Sorting column
    @Query('order') order: 'ASC' | 'DESC' = 'ASC', // Sorting order
  ): Promise<Pagination<User>> {
    const options: PaginationOptions = { page, limit };
    const filters = { username, role };
    const sorting: SortOptions = { column: sortBy, order };

    return this.userService.findAll(options, filters, sorting);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateData: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<{ message: string }> {
    return this.userService.deleteUser(id);
  }
}
