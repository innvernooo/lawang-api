/*
  Warnings:

  - The values [MUSIC,COMEDY,SPORTS,ARTS] on the enum `EventCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventCategory_new" AS ENUM ('MUSIK', 'WORKSHOP', 'KOMEDI', 'OLAHRAGA', 'SENI', 'GAMES', 'SPIRITUALITAS', 'K_POP', 'KELUARGA', 'ALAM_TERBUKA', 'SAINS', 'PENDIDIKAN', 'BUDAYA', 'KESEHATAN', 'OTOMOTIF');
ALTER TABLE "events" ALTER COLUMN "category" TYPE "EventCategory_new" USING ("category"::text::"EventCategory_new");
ALTER TYPE "EventCategory" RENAME TO "EventCategory_old";
ALTER TYPE "EventCategory_new" RENAME TO "EventCategory";
DROP TYPE "public"."EventCategory_old";
COMMIT;
