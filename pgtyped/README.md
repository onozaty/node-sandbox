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

管理者権限のPowerShellで下記を実行。

```
fsutil behavior set SymlinkEvaluation L2L:1 R2R:1 L2R:1 R2L:1
```

設定確認。

```
fsutil behavior query symlinkevaluation
```

