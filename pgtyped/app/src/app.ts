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
