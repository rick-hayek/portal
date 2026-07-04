-- AlterTable safely and conditionally to support environments where originalBookId is already present
DO $$
BEGIN
    -- Add publishYear column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Book' AND column_name='publishYear') THEN
        ALTER TABLE "Book" ADD COLUMN "publishYear" TEXT;
    END IF;

    -- Add originalBookId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Book' AND column_name='originalBookId') THEN
        ALTER TABLE "Book" ADD COLUMN "originalBookId" TEXT;
    END IF;

    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Book' AND column_name='slug') THEN
        ALTER TABLE "Book" ADD COLUMN "slug" TEXT;
        -- Populate slug with id for existing records to prevent null errors
        UPDATE "Book" SET "slug" = "id" WHERE "slug" IS NULL;
        -- Set it to NOT NULL
        ALTER TABLE "Book" ALTER COLUMN "slug" SET NOT NULL;
    END IF;

    -- Create unique index on slug if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Book' AND indexname='Book_slug_key') THEN
        CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");
    END IF;

    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='Book_originalBookId_fkey' AND table_name='Book'
    ) THEN
        ALTER TABLE "Book" ADD CONSTRAINT "Book_originalBookId_fkey" FOREIGN KEY ("originalBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;
