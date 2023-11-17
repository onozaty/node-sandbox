-- Up Migration
CREATE TABLE users (
    user_id serial,
    name text NOT NULL,
    age integer,
    constraint users_PKC primary key (user_id)
);

-- Down Migration
DROP TABLE users;
