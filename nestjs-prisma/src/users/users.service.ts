import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async find(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (user == null) {
      throw new NotFoundException();
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
    const hashedPassword = await this.hashingPassword(data.password);

    try {
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // https://www.prisma.io/docs/orm/reference/error-reference
        if (error.code == 'P2002') {
          throw new ConflictException();
        }
      }
      throw error;
    }
  }

  async update(userId: number, data: UpdateUserDto): Promise<UserDto> {
    try {
      const user = await this.prisma.user.update({
        data,
        where: {
          userId: userId,
        },
      });
      return new UserDto(user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // https://www.prisma.io/docs/orm/reference/error-reference
        if (error.code == 'P2025') {
          throw new NotFoundException();
        }
      }
      throw error;
    }
  }

  async delete(userId: number): Promise<UserDto> {
    try {
      const user = await this.prisma.user.delete({
        where: {
          userId: userId,
        },
      });
      return new UserDto(user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // https://www.prisma.io/docs/orm/reference/error-reference
        if (error.code == 'P2025') {
          throw new NotFoundException();
        }
      }
      throw error;
    }
  }

  async changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
    const userAuth = await this.prisma.userAuth.findUnique({
      where: {
        userId: userId,
      },
    });

    if (userAuth == null) {
      throw new NotFoundException();
    }

    const ok = await this.verifyPassword(
      data.oldPassword,
      userAuth.hashedPassword,
    );

    if (!ok) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.hashingPassword(data.newPassword);

    await this.prisma.userAuth.update({
      data: {
        hashedPassword: hashedPassword,
      },
      where: {
        userId: userId,
      },
    });
  }

  async verifyPassword(rawPassword: string, hashedPassword: string) {
    return await bcrypt.compare(rawPassword, hashedPassword);
  }

  async hashingPassword(rawPassword: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(rawPassword, salt);
  }
}
