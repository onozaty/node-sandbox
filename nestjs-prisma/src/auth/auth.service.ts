import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { Token } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<{
      ACCESS_TOKEN_SECRET: string;
      ACCESS_TOKEN_EXPIRES_IN: string;
      REFRESH_TOKEN_SECRET: string;
      REFRESH_TOKEN_EXPIRES_IN: string;
    }>,
  ) {}

  async login(loginDto: LoginDto): Promise<Token> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        userAuth: true,
      },
    });

    if (user?.userAuth == null) {
      throw new UnauthorizedException();
    }

    const ok = this.usersService.verifyPassword(
      loginDto.password,
      user.userAuth.hashedPassword,
    );
    if (!ok) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    };
  }
}
