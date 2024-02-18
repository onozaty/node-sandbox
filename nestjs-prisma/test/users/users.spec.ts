import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { resetDb } from '../test-utils';
import { defineUserFactory, initialize } from '../__generated__/fabbrica';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    initialize({ prisma });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb(prisma);
  });

  it('/users (GET)', async () => {
    const userFactory = defineUserFactory();
    const user1 = await userFactory.create();
    const user2 = await userFactory.create();

    const response = await request(app.getHttpServer()).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      [user1, user2].map((user) => {
        return {
          userId: user.userId,
          email: user.email,
          // API上JSONでやり取りされDate->文字列になるので
          // 期待値も文字列にして比較
          updatedAt: user.updatedAt.toISOString(),
          createdAt: user.createdAt.toISOString(),
        };
      }),
    );
  });

  it('/users (GET) Empty', async () => {
    const response = await request(app.getHttpServer()).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});
