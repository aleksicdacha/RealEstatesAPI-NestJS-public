import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { DataSource } from 'typeorm';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
      inject: [DataSource],
    },
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
