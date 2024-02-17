import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async find(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    return new UserDto(user);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        userId: 'asc',
      },
    });
    return users.map((user) => new UserDto(user));
  }

  async create(data: CreateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.create({
      data,
    });

    return new UserDto(user);
  }

  async update(userId: number, data: UpdateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.update({
      data,
      where: {
        userId: userId,
      },
    });

    return new UserDto(user);
  }

  async delete(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.delete({
      where: {
        userId: userId,
      },
    });
    return new UserDto(user);
  }
}
