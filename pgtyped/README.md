SQLから型を用意してくれるPgTypedを使ってみる。

* [adelsz/pgtyped: pgTyped \- Typesafe SQL in TypeScript](https://github.com/adelsz/pgtyped)
* [PgTyped \- Typesafe SQL in Typescript \| PgTyped](https://pgtyped.dev/)

参考になった記事。

* [PgTyped \- Node\.jsで型安全にSQLを管理するには \| HiCustomer Lab \- HiCustomer Developer's Blog](https://tech.hicustomer.jp/posts/type-safe-sql-library-for-nodejs/)

## 環境構築

Vagrant 上で試す。Ubuntu 22.04 を利用。

### Docker のインストール

* https://docs.docker.com/engine/install/ubuntu/

```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Node.js のインストール

Node.jsのインストール。

```
sudo apt update
sudo apt install nodejs npm
sudo npm -g install n
sudo n stable
sudo apt purge nodejs npm
sudo apt autoremove
```

```
node -v
```

※nodeがv20だと、`npm init -y`でエラーになったので、v18に落として進めた

### PostgreSQL のイメージ起動

`docker-compose.yml` で下記を作成。

```
version: '3.1'

services:

  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example
```

同じフォルダで実行。

```
sudo docker compose up -d
```

psql のインストール。

```
sudo apt install postgresql-client
```

psqlで接続。

```
psql -h localhost -p 5432 -U postgres
```

### `npm install` でシンボリックリンクが貼れない問題

`npm install` でエラーになったので、下記で解消した。  
(OSの再起動も必要だった)

* [Windowsホスト上のVagrantのシンボリックリンクフォルダでyarn installできない問題の解決 \- Qiita](https://qiita.com/maikya_gu/items/8e313dcd50c39f5a4b0b)

`Vagrantfile`に下記を記載。

```
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
```

管理者権限のPowerShellで下記を実行。

```
fsutil behavior set SymlinkEvaluation L2L:1 R2R:1 L2R:1 R2L:1
```

設定確認。

```
fsutil behavior query symlinkevaluation
```

※うまく行ったと思っていたが、ローカルポリシーの変更も必要だった。

* [Windows \+ Vagrant\(VirtualBox\)の共有フォルダにシンボリックリンクが作成できなくて困った｜みさき](https://note.com/m_higa/n/n902624a7895a)

## express で簡単なアプリ作る

```
mkdir app
cd app
npm init -y
npm install express
npm install -D typescript @types/node
npm install -D @types/express
npm install -D ts-node
```

`tsconfig.json`を作成する。

```
npx tsc --init
```

`app.ts` として簡単なアプリをいったん作っておく。

```ts
import express from "express";
const app = express();
const port = 3000;

app.get("/", (_, res) => res.send("Hello World!"));

app.get("/users", (_, res) => {
  const users = [
    {
      id: 1,
      name: "Taro",
    },
    {
      id: 2,
      name: "Hanako",
    },
    ,
    {
      id: 3,
      name: "Kyotaro",
    },
  ];

  res.json(users);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
```

実行。

```
npx ts-node src/app.ts
```

## node-pg-migrate

DBのマイグレーションは node-pg-migrate で行う。

* https://github.com/salsita/node-pg-migrate

`--migration-file-language=sql` はドキュメントに無いが使える。

* https://github.com/salsita/node-pg-migrate/issues/786

```
npm install node-pg-migrate pg
```

```
npx node-pg-migrate create create-users --migration-file-language=sql
```

SQLファイルに記載。

設定ファイルは `migration-config.json` で記載。

```json
{
    "user": "postgres",
    "password": "example",
    "host": "localhost",
    "port": 5432,
    "database": "postgres"
}
```

config使うためには、configモジュールのインストールが必要。

```
npm install config
```

マイグレーション実行。

```
npx node-pg-migrate up -f migration-config.json
```

## pgtyped

モジュールをインストール。

```
npm install -D @pgtyped/cli typescript
```

```
npm install @pgtyped/runtime 
```

SQLファイルを作る。
* src\queries\users.sql

```sql
/* @name SelectAll */
SELECT * FROM users;

/* @name SelectOne */
SELECT * FROM users WHERE user_id = :userId;

/* @name Insert */
INSERT INTO users (name, age) VALUES (:name, :age) RETURNING *;
```

設定ファイルを`pgtyped-config.json`で作る。

```json
{
  "transforms": [
    {
      "mode": "sql",
      "include": "**/*.sql",
      "emitTemplate": "{{dir}}/{{name}}.queries.ts"
    }
  ],
  "srcDir": "./src/",
  "failOnError": false,
  "camelCaseColumnNames": true,
  "db": {
    "dbName": "postgres",
    "user": "postgres",
    "password": "example",
    "host": "localhost",
    "port": 5432
  }
}
```

sqlファイルから型を生成。

```
$ npx pgtyped -c pgtyped-config.json 
Using a pool of 1 threads.
Processing src/queries/users.sql
Saved 2 query types from src/queries/users.sql to src/queries/users.queries.ts
```

これを使ってコード書く。

```ts
import express from "express";
import { Pool } from 'pg';
import { insert, selectAll, selectOne } from './queries/users.queries';

export const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'example',
  database: 'postgres',
});

const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (_, res) => res.send("Hello World!"));

app.get("/users", async (_, res) => {
  const client = await pool.connect();
  const users = await selectAll.run(undefined, client);
  res.json(users);
  client.release();
});

app.post("/users", async (req, res) => {
  const client = await pool.connect();
  const [user] = await insert.run(req.body, client);
  res.json(user);
  client.release();
});

app.get("/users/:id", async (req, res) => {
  const client = await pool.connect();
  const [user] = await selectOne.run({ userId: parseInt(req.params.id) }, client);
  res.json(user);
  client.release();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
```

curl でユーザ登録。

```
curl -H "Content-Type: application/json" -X POST -d "{ \"name\" : \"Taro\",  \"age\" : 20 }" http://localhost:3000/users
```

