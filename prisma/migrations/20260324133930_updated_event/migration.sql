/*
  Warnings:

  - You are about to drop the column `airline` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `flightTime` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `travelGuideline` on the `events` table. All the data in the column will be lost.
  - Added the required column `availableSeats` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSeats` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venue` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "events_category_idx";

-- DropIndex
DROP INDEX "events_location_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "airline",
DROP COLUMN "banner",
DROP COLUMN "flightTime",
DROP COLUMN "isVerified",
DROP COLUMN "location",
DROP COLUMN "price",
DROP COLUMN "travelGuideline",
ADD COLUMN     "availableSeats" INTEGER NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "ticketPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "time" TEXT NOT NULL,
ADD COLUMN     "totalSeats" INTEGER NOT NULL,
ADD COLUMN     "venue" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
