/*
  Warnings:

  - Added the required column `name` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "name" TEXT NOT NULL;
