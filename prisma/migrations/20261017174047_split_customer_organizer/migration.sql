/*
  Warnings:

  - You are about to drop the column `userId` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `points` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `event_organizers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[customerId,eventId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `points` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- DropForeignKey
ALTER TABLE "coupons" DROP CONSTRAINT "coupons_userId_fkey";

-- DropForeignKey
ALTER TABLE "event_organizers" DROP CONSTRAINT "event_organizers_userId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "points" DROP CONSTRAINT "points_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_referredById_fkey";

-- DropIndex
DROP INDEX "coupons_userId_expiresAt_idx";

-- DropIndex
DROP INDEX "password_reset_tokens_userId_idx";

-- DropIndex
DROP INDEX "points_userId_expiresAt_idx";

-- DropIndex
DROP INDEX "reviews_userId_eventId_key";

-- DropIndex
DROP INDEX "transactions_userId_idx";

-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "organizerId" UUID;

-- AlterTable
ALTER TABLE "points" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "userId",
ADD COLUMN     "customerId" UUID NOT NULL;

-- DropTable
DROP TABLE "event_organizers";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nik" VARCHAR(16),
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "phoneNumber" VARCHAR(20),
    "profilePictureUrl" VARCHAR(500),
    "referralCode" VARCHAR(12) NOT NULL,
    "referredById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ORGANIZER',
    "profilePictureUrl" VARCHAR(500),
    "organizerName" VARCHAR(150) NOT NULL,
    "organizerType" "OrganizerType" NOT NULL,
    "legalName" VARCHAR(200) NOT NULL,
    "organizerBio" TEXT,
    "websiteUrl" VARCHAR(255),
    "instagramUrl" VARCHAR(255),
    "npwp" VARCHAR(16) NOT NULL,
    "npwpImageUrl" VARCHAR(500) NOT NULL,
    "nib" VARCHAR(13),
    "picName" VARCHAR(100) NOT NULL,
    "picNik" VARCHAR(16) NOT NULL,
    "picKtpImageUrl" VARCHAR(500) NOT NULL,
    "picPhoneNumber" VARCHAR(20) NOT NULL,
    "officeAddress" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(5) NOT NULL,
    "bankName" VARCHAR(100) NOT NULL,
    "bankAccountNumber" VARCHAR(30) NOT NULL,
    "bankAccountHolder" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_username_key" ON "customers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "customers_nik_key" ON "customers"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "customers_referralCode_key" ON "customers"("referralCode");

-- CreateIndex
CREATE INDEX "customers_referredById_idx" ON "customers"("referredById");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_email_key" ON "organizers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_username_key" ON "organizers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_npwp_key" ON "organizers"("npwp");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_nib_key" ON "organizers"("nib");

-- CreateIndex
CREATE INDEX "coupons_customerId_expiresAt_idx" ON "coupons"("customerId", "expiresAt");

-- CreateIndex
CREATE INDEX "password_reset_tokens_customerId_idx" ON "password_reset_tokens"("customerId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_organizerId_idx" ON "password_reset_tokens"("organizerId");

-- CreateIndex
CREATE INDEX "points_customerId_expiresAt_idx" ON "points"("customerId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_customerId_eventId_key" ON "reviews"("customerId", "eventId");

-- CreateIndex
CREATE INDEX "transactions_customerId_idx" ON "transactions"("customerId");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
