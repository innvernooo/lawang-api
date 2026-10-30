/*
  Warnings:

  - Changed the type of `price` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('PAID', 'FREE');

-- AlterTable
ALTER TABLE "events" DROP COLUMN "price",
ADD COLUMN     "price" "PricingType" NOT NULL;
