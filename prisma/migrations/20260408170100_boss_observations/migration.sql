-- First convert existing data to text temporarily
ALTER TABLE "appartements" ALTER COLUMN "type" TYPE TEXT;

-- Update existing values
UPDATE "appartements" SET "type" = 'CHAMBRE' WHERE "type" = 'T2';
UPDATE "appartements" SET "type" = 'APPARTEMENT' WHERE "type" = 'T3';
UPDATE "appartements" SET "type" = 'APPARTEMENT_MEUBLE' WHERE "type" = 'T4';

-- Drop old enum and create new one
DROP TYPE "TypeAppartement";
CREATE TYPE "TypeAppartement" AS ENUM ('STUDIO', 'CHAMBRE', 'APPARTEMENT', 'APPARTEMENT_MEUBLE', 'VILLA');

-- Convert column back to enum
ALTER TABLE "appartements" ALTER COLUMN "type" TYPE "TypeAppartement" USING ("type"::"TypeAppartement");

-- DropIndex
DROP INDEX IF EXISTS "paiements_bailId_moisConcerne_key";

-- AlterTable
ALTER TABLE "paiements" ADD COLUMN IF NOT EXISTS "montantAutres" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "montantCaution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "notesAutres" TEXT;
