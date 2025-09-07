-- CreateTable
CREATE TABLE "public"."app_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."todo" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "public"."app_user"("email");

-- CreateIndex
CREATE INDEX "idx_todo_user_id" ON "public"."todo"("user_id");

-- AddForeignKey
ALTER TABLE "public"."todo" ADD CONSTRAINT "todo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
