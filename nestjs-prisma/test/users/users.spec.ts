import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { resetDb } from '../test-utils';
import { defineUserFactory, initialize } from '../__generated__/fabbrica';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userFactory = defineUserFactory();

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
    // Arrange
    const user1 = await userFactory.create();
    const user2 = await userFactory.create();

    // Act
    const response = await request(app.getHttpServer()).get('/users');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
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
    // Act
    const response = await request(app.getHttpServer()).get('/users');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual([]);
  });

  it('/users/:id (GET)', async () => {
    // Arrange
    await userFactory.create();
    const user2 = await userFactory.create();

    // Act
    const response = await request(app.getHttpServer()).get(
      `/users/${user2.userId}`,
    );

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      userId: user2.userId,
      email: user2.email,
      // API上JSONでやり取りされDate->文字列になるので
      // 期待値も文字列にして比較
      updatedAt: user2.updatedAt.toISOString(),
      createdAt: user2.createdAt.toISOString(),
    });
  });

  it('/users/:id (GET) Not Found', async () => {
    // Act
    const response = await request(app.getHttpServer()).get('/users/1');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('/users (POST)', async () => {
    // Arrange
    const email = 'user@example.com';

    // Act
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: 1,
      email: email,
      updatedAt: expect.anything(),
      createdAt: expect.anything(),
    });
  });

  it('/users (POST) Conflict', async () => {
    // Arrange
    const email = 'user@example.com';
    await userFactory.create({ email: email });

    // Act
    // 既に作成済みのユーザのemailを指定
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(response.body).toEqual({
      message: 'Conflict',
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it('/users/:id (PUT)', async () => {
    // Arrange
    await userFactory.create();
    const user2 = await userFactory.create();
    const updateEmail = user2.email + '.updated';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user2.userId}`)
      .send({
        email: updateEmail,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      userId: user2.userId,
      email: updateEmail,
      updatedAt: expect.anything(),
      createdAt: expect.anything(),
    });

    // 作成日時と更新日時が異なること
    expect(response.body.updatedAt).not.toEqual(response.body.createdAt);
  });

  it('/users/:id (PUT) Not Found', async () => {
    // Act
    // 存在しないユーザ
    const response = await request(app.getHttpServer()).put('/users/1').send({
      email: 'xxxxx',
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('/users/:id (DELETE)', async () => {
    // Arrange
    await userFactory.create();
    const user2 = await userFactory.create();

    // Act
    const response = await request(app.getHttpServer()).delete(
      `/users/${user2.userId}`,
    );

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      userId: user2.userId,
      email: user2.email,
      updatedAt: expect.anything(),
      createdAt: expect.anything(),
    });
  });

  it('/users/:id (DELETE) Not Found', async () => {
    // Act
    // 存在しないユーザ
    const response = await request(app.getHttpServer()).delete('/users/1');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });
});
