-- Up Migration
CREATE TABLE users (
    id serial,
    name text,
    constraint users_PKC primary key (id)
);

-- Down Migration
DROP TABLE users;
