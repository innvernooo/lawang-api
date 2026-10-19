/*
  Warnings:

  - You are about to alter the column `email` on the `organizers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.
  - You are about to alter the column `city` on the `organizers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `province` on the `organizers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `bankName` on the `organizers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "organizers" ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "province" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "bankName" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "bankAccountHolder" SET DATA TYPE VARCHAR(200);
