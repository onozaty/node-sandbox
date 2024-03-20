import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { initialize } from '../__generated__/fabbrica';
import { Tester } from '../tester';

let app: INestApplication;
let prisma: PrismaService;
let tester: Tester;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  tester = new Tester(app);
  prisma = app.get<PrismaService>(PrismaService);
  initialize({ prisma });

  await app.init();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await tester.resetDb();
});

describe('AuthController#login', () => {
  it('ログイン成功', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'Aa123456??';
    await tester.createTestUser({ email, password });

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('ログイン失敗 emailが一致しない', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'Aa123456??';
    await tester.createTestUser({ email, password });

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email + 'xxx', // emailを一致しないものに
        password: password,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('ログイン失敗 passwordが一致しない', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'Aa123456??';
    await tester.createTestUser({ email, password });

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password + 'xxx', // passwordを一致しないものに
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  describe('AuthController#getProfile', () => {
    it('プロフィール取得', async () => {
      // Arrange
      const email = 'test@example.com';
      const operator = await tester.createTestUser({ email });

      // Act
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${operator.accessToken}`);

      // Assert
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        userId: operator.userId,
        email: email,
      });
    });
  });
});
