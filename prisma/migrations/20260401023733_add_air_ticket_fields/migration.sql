-- AlterTable
ALTER TABLE "events" ADD COLUMN     "airlineName" TEXT,
ADD COLUMN     "baggageAllowance" TEXT,
ADD COLUMN     "flightClass" TEXT,
ADD COLUMN     "flightNumber" TEXT,
ADD COLUMN     "isRefundable" BOOLEAN NOT NULL DEFAULT false;
