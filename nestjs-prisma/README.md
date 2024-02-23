## TODO

* [x] DevContainerの設定
* [x] Prismaの導入
* [x] Swaggerの導入
* [ ] 認証
* [x] バリデーション
* [x] テスト用DBの切り替え、リセット

## メモ

* ベースにしたリポジトリ(TypeScriptでのStarter)
  * [nestjs/typescript\-starter: Nest framework TypeScript starter :coffee:](https://github.com/nestjs/typescript-starter)
* Prisma
  * [Prisma \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/recipes/prisma)
* OpenAPI / Swagger
  * [OpenAPI \(Swagger\) \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/openapi/introduction)
  * CLIプラグインを使うことで、ApiPropertyの情報生成が楽になる
    * [CLI Plugin \- OpenAPI \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/openapi/cli-plugin)
* DBリセット
  * https://www.prisma.io/docs/orm/prisma-client/queries/crud#deleting-all-data-with-raw-sql--truncate
  * シーケンスリセットしたいので `RESTART IDENTITY` も付ける
* テスト時のデータ作成は fabbrica を利用
  * [Quramy/prisma\-fabbrica: Prisma generator to define model factory](https://github.com/Quramy/prisma-fabbrica)
* Validation
  * [Validation \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/techniques/validation)
  * [typestack/class\-validator: Decorator\-based property validation for classes\.](https://github.com/typestack/class-validator)
