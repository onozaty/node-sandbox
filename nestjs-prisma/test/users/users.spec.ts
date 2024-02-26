import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { defineUserFactory, initialize } from '../__generated__/fabbrica';
import { resetDb } from '../test-utils';

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

describe('UsersController#findAll', () => {
  it('複数件', async () => {
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

  it('0件', async () => {
    // Act
    const response = await request(app.getHttpServer()).get('/users');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual([]);
  });
});

describe('UsersController#find', () => {
  it('正常', async () => {
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

  it('無し', async () => {
    // Act
    const response = await request(app.getHttpServer()).get('/users/1');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });
});

describe('UsersController#create', () => {
  it('正常', async () => {
    // Arrange
    const email = 'user@example.com';
    const password = 'aA1*12345';

    // Act
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
      password: password,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: 1,
      email: email,
      updatedAt: expect.anything(),
      createdAt: expect.anything(),
    });

    // DBの登録状態確認
    const users = await prisma.user.findMany();
    expect(users).toEqual([
      {
        userId: 1,
        email: email,
        updatedAt: expect.anything(),
        createdAt: expect.anything(),
      },
    ]);

    const userAuths = await prisma.userAuth.findMany();
    expect(userAuths).toEqual([
      {
        userId: 1,
        hashedPassword: expect.anything(),
        updatedAt: expect.anything(),
        createdAt: expect.anything(),
      },
    ]);
  });

  it('Conflict', async () => {
    // Arrange
    const email = 'user@example.com';
    const password = 'aA1*12345';
    await userFactory.create({ email: email });

    // Act
    // 既に作成済みのユーザのemailを指定
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
      password: password,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(response.body).toEqual({
      message: 'Conflict',
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it('Bad Request: email指定なし', async () => {
    // Arrange
    const password = 'aA1*12345';

    // Act
    const response = await request(app.getHttpServer()).post('/users').send({
      password: password,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['email must be an email', 'email should not be empty'],
      statusCode: 400,
    });
  });

  it('Bad Request: emailではない', async () => {
    // Arrange
    // メールとしておかしい形式
    const email = 'xxxxx';
    const password = 'aA1*12345';

    // Act
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
      password: password,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['email must be an email'],
      statusCode: 400,
    });
  });

  it('Bad Request: password指定なし', async () => {
    // Arrange
    const email = 'user@example.com';
    const password = '';

    // Act
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
      password: password,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'password is not strong enough',
        'password should not be empty',
      ],
      statusCode: 400,
    });
  });

  it('Bad Request: passwordの強度が足りない', async () => {
    // Arrange
    const email = 'user@example.com';
    // パスワードで記号無し
    const password = 'aA1x12345';

    // Act
    const response = await request(app.getHttpServer()).post('/users').send({
      email: email,
      password: password,
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['password is not strong enough'],
      statusCode: 400,
    });
  });
});

describe('UsersController#update', () => {
  it('正常', async () => {
    // Arrange
    await userFactory.create();
    const user2 = await userFactory.create();
    const updateEmail = 'updated@example.com';

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

  it('Not Found', async () => {
    // Act
    // 存在しないユーザ
    const response = await request(app.getHttpServer()).put('/users/1').send({
      email: 'test@example.com',
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('Bad Request: email指定なし', async () => {
    // Arrange
    await userFactory.create();
    const user2 = await userFactory.create();
    const updateEmail = '';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user2.userId}`)
      .send({
        email: updateEmail,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['email must be an email', 'email should not be empty'],
      statusCode: 400,
    });
  });

  it('Bad Request: emailではない', async () => {
    // Arrange
    await userFactory.create();
    const user2 = await userFactory.create();
    // メールとしておかしい形式
    const updateEmail = 'xxxxx';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user2.userId}`)
      .send({
        email: updateEmail,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['email must be an email'],
      statusCode: 400,
    });
  });

  it('Bad Request: idが数値ではない', async () => {
    // Act
    // idに数値以外
    const response = await request(app.getHttpServer()).put(`/users/xx`).send({
      email: 'a@example.com',
    });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['id must be a number conforming to the specified constraints'],
      statusCode: 400,
    });
  });
});

describe('UsersController#delete', () => {
  it('正常', async () => {
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

  it('Not Found', async () => {
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

  it('Bad Request: idが数値ではない', async () => {
    // Act
    // idに数値以外
    const response = await request(app.getHttpServer()).delete('/users/x');

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['id must be a number conforming to the specified constraints'],
      statusCode: 400,
    });
  });
});
