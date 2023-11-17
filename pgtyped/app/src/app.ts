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
