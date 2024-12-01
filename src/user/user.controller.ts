import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './roles.enum';
import { RolesGuard } from '../auth/roles.guard'; // Import RolesGuard

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('test')
  @UseGuards(JwtAuthGuard)
  test(@Req() req) {
    console.log('Test route user:', req.user); // Log the user
    return req.user;
  }

  @Get()
  // @Roles(Role.USER) // Only admins can access this endpoint
  @UseGuards(JwtAuthGuard) // Protect with JWT and Role Guard
  findAll(@Req() req: Request) {
    console.log(req);
    console.log('findAll method reached');
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR) // Admins and Editors can access this endpoint
  @UseGuards(JwtAuthGuard, RolesGuard) // Protect with JWT and Role Guard
  findOne(@Param('id') id: number) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // Only admins can update users
  @UseGuards(JwtAuthGuard, RolesGuard) // Protect with JWT and Role Guard
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete users
  @UseGuards(JwtAuthGuard, RolesGuard) // Protect with JWT and Role Guard
  remove(@Param('id') id: number) {
    return this.userService.remove(+id);
  }
}
