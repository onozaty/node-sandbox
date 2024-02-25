-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_auths" (
    "user_id" INTEGER NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),

    CONSTRAINT "user_auths_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "user_auths" ADD CONSTRAINT "user_auths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
