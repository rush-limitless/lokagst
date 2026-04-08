-- AlterEnum
ALTER TYPE "Etage" ADD VALUE 'CINQUIEME';

-- AlterEnum
BEGIN;
CREATE TYPE "TypeAppartement_new" AS ENUM ('STUDIO', 'CHAMBRE', 'APPARTEMENT', 'APPARTEMENT_MEUBLE', 'VILLA');
ALTER TABLE "appartements" ALTER COLUMN "type" TYPE "TypeAppartement_new" USING ("type"::text::"TypeAppartement_new");
ALTER TYPE "TypeAppartement" RENAME TO "TypeAppartement_old";
ALTER TYPE "TypeAppartement_new" RENAME TO "TypeAppartement";
DROP TYPE "public"."TypeAppartement_old";
COMMIT;

-- DropIndex
DROP INDEX "paiements_bailId_moisConcerne_key";

-- AlterTable
ALTER TABLE "paiements" ADD COLUMN "montantAutres" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "montantCaution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "notesAutres" TEXT;
