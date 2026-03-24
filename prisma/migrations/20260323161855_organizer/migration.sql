/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `organizers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `organizers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organizers" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizers_email_key" ON "organizers"("email");
