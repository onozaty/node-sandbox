-- Up Migration
CREATE TABLE users (
    user_id serial,
    name text,
    constraint users_PKC primary key (user_id)
);

-- Down Migration
DROP TABLE users;
