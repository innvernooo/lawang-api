/*
  Warnings:

  - Added the required column `exceprt` to the `readings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "readings" ADD COLUMN     "exceprt" VARCHAR(200) NOT NULL;
