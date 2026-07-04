-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImageURL" TEXT,
    "coverImage" TEXT,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "translator" TEXT,
    "isbn" TEXT,
    "description" TEXT,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);
