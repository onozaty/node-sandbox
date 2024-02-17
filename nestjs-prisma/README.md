## TODO

* [x] DevContainerの設定
* [x] Prismaの導入
* [x] Swaggerの導入
* [ ] 認証
* [ ] バリデーション
* [ ] テスト用DBの切り替え、リセット

## メモ

* [nestjs/typescript\-starter: Nest framework TypeScript starter :coffee:](https://github.com/nestjs/typescript-starter)
  * ベースにしたリポジトリ
* [Prisma \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/recipes/prisma)
* [OpenAPI \(Swagger\) \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/openapi/introduction)
  * CLIプラグインを使うことで、ApiPropertyの情報生成が楽になる
    * [CLI Plugin \- OpenAPI \| NestJS \- A progressive Node\.js framework](https://docs.nestjs.com/openapi/cli-plugin)
* テスト時のデータリセット方法は下記を参考に
  * https://www.prisma.io/docs/orm/prisma-client/queries/crud#deleting-all-data-with-raw-sql--truncate
  * シーケンスリセットしたいので `RESTART IDENTITY` も付ける
* テスト時のデータ作成は fabbrica を利用
  * [Quramy/prisma\-fabbrica: Prisma generator to define model factory](https://github.com/Quramy/prisma-fabbrica)