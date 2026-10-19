/*
  Warnings:

  - You are about to drop the column `npwpImageUrl` on the `organizers` table. All the data in the column will be lost.
  - You are about to drop the column `picKtpImageUrl` on the `organizers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organizers" DROP COLUMN "npwpImageUrl",
DROP COLUMN "picKtpImageUrl";
