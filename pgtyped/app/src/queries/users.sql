/* @name SelectAll */
SELECT * FROM users;

/* @name SelectOne */
SELECT * FROM users WHERE user_id = :userId;

/* @name Insert */
INSERT INTO users (name, age) VALUES (:name, :age) RETURNING *;
