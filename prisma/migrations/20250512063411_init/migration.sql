-- CreateTable
CREATE TABLE "user" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "username" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "post" (
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "time_to_read" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "category_id" TEXT,

    CONSTRAINT "post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "comment" (
    "comment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "category" (
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "tag" (
    "tag_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "_PostToTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "comment_post_id_idx" ON "comment"("post_id");

-- CreateIndex
CREATE INDEX "comment_user_id_idx" ON "comment"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE INDEX "_PostToTags_B_index" ON "_PostToTags"("B");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTags" ADD CONSTRAINT "_PostToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTags" ADD CONSTRAINT "_PostToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;
