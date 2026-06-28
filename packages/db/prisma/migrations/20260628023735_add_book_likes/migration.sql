-- CreateTable
CREATE TABLE "BookLike" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookLike_bookId_idx" ON "BookLike"("bookId");

-- CreateIndex
CREATE INDEX "BookLike_userId_idx" ON "BookLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookLike_bookId_userId_key" ON "BookLike"("bookId", "userId");

-- AddForeignKey
ALTER TABLE "BookLike" ADD CONSTRAINT "BookLike_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookLike" ADD CONSTRAINT "BookLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
