import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterPropertyDto } from '@src/property/dto/filter-property.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(@Query() query: FilterPropertyDto) {
    return this.userService.findAll(query);
  }
  // async findAll(@Query() query: UserQueryDto) {
  //   console.log('Received Query:', query);  // Log the raw query to check
  //
  //   // Parse filters manually from the string
  //   let filters = {};
  //   if (query.filters) {
  //     try {
  //       filters = JSON.parse(query.filters);
  //     } catch (e) {
  //       throw new BadRequestException('Invalid filters format');
  //     }
  //   }
  //
  //   console.log('Parsed Filters:', filters);
  //
  //   // Pass filters to the service method
  //   return this.userService.findAll(query, filters);
  // }

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
