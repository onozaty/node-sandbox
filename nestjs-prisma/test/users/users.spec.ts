import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { defineUserFactory, initialize } from '../__generated__/fabbrica';
import { Tester } from '../tester';

let app: INestApplication;
let prisma: PrismaService;
let tester: Tester;

const userFactory = defineUserFactory();

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

describe('UsersController#findAll', () => {
  it('複数件', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const user1 = await userFactory.create();
    const user2 = await userFactory.create();

    // Act
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`);

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      [operator, user1, user2].map((user) => {
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

  // 認証するためにユーザは1つは必要なので0件はできない
});

describe('UsersController#find', () => {
  it('正常', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    await userFactory.create();
    const user2 = await userFactory.create();

    // Act
    const response = await request(app.getHttpServer())
      .get(`/users/${user2.userId}`)
      .set('Authorization', `Bearer ${operator.accessToken}`);

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
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    const response = await request(app.getHttpServer())
      .get('/users/2')
      .set('Authorization', `Bearer ${operator.accessToken}`);

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
    const operator = await tester.createTestUser({});
    const email = 'user@example.com';
    const password = 'aA1*12345';

    // Act
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        email: email,
        password: password,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: 2, // operatorがuserId:1
      email: email,
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });

    // DBの登録状態確認
    const users = await prisma.user.findMany();
    expect(users).toEqual([
      {
        userId: operator.userId,
        email: operator.email,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
      {
        userId: 2,
        email: email,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
    ]);

    const userAuths = await prisma.userAuth.findMany();
    expect(userAuths).toEqual([
      {
        userId: operator.userId,
        hashedPassword: expect.any(String),
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
      {
        userId: 2,
        hashedPassword: expect.any(String),
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
    ]);
  });

  it('Conflict', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const email = 'user@example.com';
    const password = 'aA1*12345';
    await userFactory.create({ email: email });

    // Act
    // 既に作成済みのユーザのemailを指定
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    const password = 'aA1*12345';

    // Act
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    // メールとしておかしい形式
    const email = 'xxxxx';
    const password = 'aA1*12345';

    // Act
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    const email = 'user@example.com';
    const password = '';

    // Act
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    const email = 'user@example.com';
    // パスワードで記号無し
    const password = 'aA1x12345';

    // Act
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    await userFactory.create();
    const user2 = await userFactory.create();
    const updateEmail = 'updated@example.com';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user2.userId}`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        email: updateEmail,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      userId: user2.userId,
      email: updateEmail,
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });

    // 作成日時と更新日時が異なること
    expect(response.body.updatedAt).not.toEqual(response.body.createdAt);
  });

  it('Not Found', async () => {
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    // 存在しないユーザ
    const response = await request(app.getHttpServer())
      .put('/users/2')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    await userFactory.create();
    const user2 = await userFactory.create();
    const updateEmail = '';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user2.userId}`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
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
    const operator = await tester.createTestUser({});
    await userFactory.create();
    const user2 = await userFactory.create();
    // メールとしておかしい形式
    const updateEmail = 'xxxxx';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user2.userId}`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
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
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    // idに数値以外
    const response = await request(app.getHttpServer())
      .put(`/users/xx`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
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
    const operator = await tester.createTestUser({});
    await userFactory.create();
    const user2 = await userFactory.create();

    // Act
    const response = await request(app.getHttpServer())
      .delete(`/users/${user2.userId}`)
      .set('Authorization', `Bearer ${operator.accessToken}`);

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      userId: user2.userId,
      email: user2.email,
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('Not Found', async () => {
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    // 存在しないユーザ
    const response = await request(app.getHttpServer())
      .delete('/users/2')
      .set('Authorization', `Bearer ${operator.accessToken}`);

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('Bad Request: idが数値ではない', async () => {
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    // idに数値以外
    const response = await request(app.getHttpServer())
      .delete('/users/x')
      .set('Authorization', `Bearer ${operator.accessToken}`);

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['id must be a number conforming to the specified constraints'],
      statusCode: 400,
    });
  });
});

describe('UsersController#changePassword', () => {
  it('正常', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const oldPassword = 'aA1*12345';
    const user = await tester.createTestUser({ password: oldPassword });

    // パスワード変更前のuserAuthを比較用に保持
    const oldUserAuth = await prisma.userAuth.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });

    const newPassword = 'Aa1**********';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user.userId}/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.OK);

    // userAuthが更新されていることを確認
    const newUserAuth = await prisma.userAuth.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });

    expect(newUserAuth.hashedPassword).not.toEqual(oldUserAuth.hashedPassword);
    expect(newUserAuth.updatedAt).not.toEqual(oldUserAuth.updatedAt);
    expect(newUserAuth.createdAt).toEqual(oldUserAuth.createdAt);
  });

  it('Not Found', async () => {
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    // 存在しないユーザ
    const response = await request(app.getHttpServer())
      .put(`/users/2/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: 'aA1*12345',
        newPassword: 'aA1*12345',
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('Bad Request: oldPasswordが一致しない', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const oldPassword = 'aA1*12345';
    const user = await tester.createTestUser({ password: oldPassword });

    const newPassword = 'Aa1**********';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user.userId}/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: oldPassword + 'xxx', // oldPasswordとして間違ったものを指定
        newPassword: newPassword,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'Invalid password',
      statusCode: 400,
    });
  });

  it('Bad Request: oldPasswordなし', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const oldPassword = 'aA1*12345';
    const user = await tester.createTestUser({ password: oldPassword });

    const newPassword = 'Aa1**********';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user.userId}/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: '', // oldPasswordが空
        newPassword: newPassword,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['oldPassword should not be empty'],
      statusCode: 400,
    });
  });

  it('Bad Request: newPasswordなし', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const oldPassword = 'aA1*12345';
    const user = await tester.createTestUser({ password: oldPassword });

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user.userId}/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: oldPassword,
        // nedPasswordなし
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'newPassword is not strong enough',
        'newPassword should not be empty',
      ],
      statusCode: 400,
    });
  });

  it('Bad Request: newPasswordの強度が足りない', async () => {
    // Arrange
    const operator = await tester.createTestUser({});
    const oldPassword = 'aA1*12345';
    const user = await tester.createTestUser({ password: oldPassword });

    // 半角英字が無い
    const newPassword = 'A1*1234567';

    // Act
    const response = await request(app.getHttpServer())
      .put(`/users/${user.userId}/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

    // Assert
    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['newPassword is not strong enough'],
      statusCode: 400,
    });
  });

  it('Bad Request: idが数値ではない', async () => {
    // Arrange
    const operator = await tester.createTestUser({});

    // Act
    // idに数値以外
    const response = await request(app.getHttpServer())
      .put(`/users/xx/password`)
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .send({
        oldPassword: 'aA1*12345',
        newPassword: 'aA1*12345',
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
