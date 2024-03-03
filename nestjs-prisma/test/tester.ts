import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { TokenDto } from '../src/auth/dto/token.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { defineUserFactory, initialize } from './__generated__/fabbrica';

export class Tester {
  private readonly prisma: PrismaService;
  private readonly jwtService: JwtService;
  private readonly config: ConfigService<{
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }>;

  constructor(app: INestApplication) {
    this.prisma = app.get<PrismaService>(PrismaService);
    this.jwtService = app.get<JwtService>(JwtService);
    this.config = app.get<ConfigService>(ConfigService);

    initialize({ prisma: this.prisma });
  }

  async resetDb() {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
      );
    } catch (error) {
      console.log({ error });
    }
  }

  async createTestUser({
    email = faker.internet.email(),
    password = faker.internet.password(),
  }: {
    email?: string;
    password?: string;
  }): Promise<User & TokenDto> {
    const userFactory = defineUserFactory();

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userFactory.create({
      email: email,
      userAuth: {
        create: { hashedPassword: hashedPassword },
      },
    });

    const payload = { sub: user.userId, username: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '1h',
    });

    return {
      ...user,
      accessToken,
      refreshToken,
    };
  }
}
