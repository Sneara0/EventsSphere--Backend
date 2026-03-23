-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "needPasswordReset" BOOLEAN NOT NULL DEFAULT false;
