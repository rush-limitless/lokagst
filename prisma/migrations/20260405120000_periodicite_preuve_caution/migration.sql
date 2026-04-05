-- Create new enums
CREATE TYPE "Periodicite" AS ENUM ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL');
CREATE TYPE "ModePaiement_new" AS ENUM ('VIREMENT_BANCAIRE', 'ORANGE_MONEY');

-- Add temp text column, migrate data, swap
ALTER TABLE "paiements" ADD COLUMN "modePaiement_tmp" TEXT;
UPDATE "paiements" SET "modePaiement_tmp" = CASE
  WHEN "modePaiement"::text IN ('ESPECES', 'VIREMENT') THEN 'VIREMENT_BANCAIRE'
  WHEN "modePaiement"::text = 'MOBILE_MONEY' THEN 'ORANGE_MONEY'
  ELSE 'VIREMENT_BANCAIRE'
END;
ALTER TABLE "paiements" DROP COLUMN "modePaiement";
ALTER TABLE "paiements" ADD COLUMN "modePaiement" "ModePaiement_new" NOT NULL DEFAULT 'VIREMENT_BANCAIRE';
UPDATE "paiements" SET "modePaiement" = "modePaiement_tmp"::"ModePaiement_new";
ALTER TABLE "paiements" DROP COLUMN "modePaiement_tmp";

-- Drop old enum, rename new
DROP TYPE "ModePaiement";
ALTER TYPE "ModePaiement_new" RENAME TO "ModePaiement";

-- Add new columns
ALTER TABLE "baux" ADD COLUMN IF NOT EXISTS "periodicite" "Periodicite" NOT NULL DEFAULT 'MENSUEL';
ALTER TABLE "baux" ADD COLUMN IF NOT EXISTS "cautionPayee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "baux" ADD COLUMN IF NOT EXISTS "datePremierLoyer" TIMESTAMP(3);
ALTER TABLE "paiements" ADD COLUMN IF NOT EXISTS "preuvePaiement" TEXT;
