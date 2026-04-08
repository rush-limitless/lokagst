-- AlterEnum TypeAppartement
CREATE TYPE "TypeAppartement_new" AS ENUM ('STUDIO', 'CHAMBRE', 'APPARTEMENT', 'APPARTEMENT_MEUBLE', 'VILLA');
ALTER TABLE "appartements" ALTER COLUMN "type" TYPE "TypeAppartement_new" USING ("type"::text::"TypeAppartement_new");
ALTER TYPE "TypeAppartement" RENAME TO "TypeAppartement_old";
ALTER TYPE "TypeAppartement_new" RENAME TO "TypeAppartement";
DROP TYPE "TypeAppartement_old";

-- DropIndex
DROP INDEX IF EXISTS "paiements_bailId_moisConcerne_key";

-- AlterTable
ALTER TABLE "paiements" ADD COLUMN IF NOT EXISTS "montantAutres" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "montantCaution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "notesAutres" TEXT;
