import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { ApiConflictResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ユーザ一覧を取得します。
   * @returns ユーザ一覧
   */
  @Get()
  async findAll(): Promise<UserDto[]> {
    return await this.usersService.findAll();
  }

  /**
   * ユーザを取得します。
   * @param params パラメータ(ユーザID)
   * @returns ユーザ
   */
  @Get(':id')
  @ApiNotFoundResponse({ description: 'ユーザが存在しない場合' })
  async find(@Param() params: UserIdParamDto): Promise<UserDto> {
    const user = await this.usersService.find(params.id);
    if (user == null) {
      throw new NotFoundException();
    }
    return user;
  }

  /**
   * ユーザを作成します。
   * @param createUserDto 作成ユーザ情報
   * @returns ユーザ
   */
  @Post()
  @ApiConflictResponse({ description: '同じemailのユーザが既に存在した場合' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      return await this.usersService.create(createUserDto);
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

  /**
   * ユーザを更新します。
   * @param params パラメータ(ユーザID)
   * @param updateUserDto 更新ユーザ情報
   * @returns ユーザ
   */
  @Put(':id')
  async update(
    @Param() params: UserIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    try {
      return await this.usersService.update(params.id, updateUserDto);
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

  /**
   * ユーザを削除します。
   * @param params パラメータ(ユーザID)
   * @returns ユーザ
   */
  @Delete(':id')
  async delete(@Param() params: UserIdParamDto): Promise<UserDto> {
    try {
      return await this.usersService.delete(Number(params.id));
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
}
