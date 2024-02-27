import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

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
    return await this.usersService.find(params.id);
  }

  /**
   * ユーザを作成します。
   * @param createUserDto 作成ユーザ情報
   * @returns ユーザ
   */
  @Post()
  @ApiConflictResponse({ description: '同じemailのユーザが既に存在した場合' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return await this.usersService.create(createUserDto);
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
    return await this.usersService.update(params.id, updateUserDto);
  }

  /**
   * ユーザを削除します。
   * @param params パラメータ(ユーザID)
   * @returns ユーザ
   */
  @Delete(':id')
  async delete(@Param() params: UserIdParamDto): Promise<UserDto> {
    return await this.usersService.delete(Number(params.id));
  }

  /**
   * パスワードを変更します。
   * @param params パラメータ(ユーザID)
   * @param changePassword 更新ユーザ情報
   */
  @Put(':id/password')
  async changePassword(
    @Param() params: UserIdParamDto,
    @Body() changePassword: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(params.id, changePassword);
  }
}
