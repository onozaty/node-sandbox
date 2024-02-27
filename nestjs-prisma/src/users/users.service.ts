import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async find(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (user == null) {
      return null;
    }
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
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        userAuth: {
          create: {
            hashedPassword: hashedPassword,
          },
        },
      },
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

  async changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (user == null) {
      throw new NotFoundException();
    }

    const ok = await this.verifyPassword(userId, data.oldPassword);
    if (!ok) {
      throw new BadRequestException('旧パスワードが正しくありません。');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await this.prisma.userAuth.update({
      data: {
        hashedPassword: hashedPassword,
      },
      where: {
        userId: userId,
      },
    });
  }

  async verifyPassword(userId: number, password: string) {
    const userAuth = await this.prisma.userAuth.findUnique({
      where: {
        userId: userId,
      },
    });

    if (userAuth == null) {
      return false;
    }

    return await bcrypt.compare(password, userAuth.hashedPassword);
  }
}
