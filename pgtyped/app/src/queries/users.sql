/* @name SelectAll */
SELECT * FROM users;

/* @name SelectOne */
SELECT * FROM users WHERE user_id = :userId;

/*
  @name Insert
  @param user -> (name)
*/
INSERT INTO users (name) VALUES :user RETURNING user_id;
