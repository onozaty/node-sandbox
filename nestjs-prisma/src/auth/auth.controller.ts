import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthedUserDto } from './dto/authed-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * ログインします。
   * @returns トークン
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * プロフィールを取得します。
   * @param req リクエスト
   * @returns プロフィール
   */
  @Get('profile')
  getProfile(@Request() req: Request & { user: AuthedUserDto }) {
    return req.user;
  }
}
