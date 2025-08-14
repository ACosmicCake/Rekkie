-- AlterTable
ALTER TABLE "UserPreference" ADD COLUMN "embedding" vector(1536);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "embedding" vector(1536);
