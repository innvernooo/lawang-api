/*
  Warnings:

  - You are about to drop the column `price` on the `events` table. All the data in the column will be lost.
  - Added the required column `pricingType` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "price",
ADD COLUMN     "pricingType" "PricingType" NOT NULL;
