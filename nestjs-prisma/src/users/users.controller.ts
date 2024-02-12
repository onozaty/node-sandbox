import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';

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
  async find(@Param() params: UserIdParamDto): Promise<UserDto> {
    return await this.usersService.find(params.id);
  }

  /**
   * ユーザを作成します。
   * @param createUserDto 作成ユーザ情報
   * @returns ユーザ
   */
  @Post()
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
}
