-- CreateEnum
CREATE TYPE "PenaliteType" AS ENUM ('POURCENTAGE', 'MONTANT_FIXE');

-- AlterEnum
ALTER TYPE "StatutBail" ADD VALUE 'SUSPENDU';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeEmail" ADD VALUE 'RAPPEL_ECHEANCE';
ALTER TYPE "TypeEmail" ADD VALUE 'NOTIFICATION_PENALITE';
ALTER TYPE "TypeEmail" ADD VALUE 'MISE_EN_DEMEURE';
ALTER TYPE "TypeEmail" ADD VALUE 'SUSPENSION_BAIL';
ALTER TYPE "TypeEmail" ADD VALUE 'RENOUVELLEMENT_BAIL';
ALTER TYPE "TypeEmail" ADD VALUE 'NON_RENOUVELLEMENT';

-- AlterTable
ALTER TABLE "baux" ADD COLUMN     "augmentationLoyer" INTEGER,
ADD COLUMN     "chargesLocatives" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "clausesParticulieres" TEXT,
ADD COLUMN     "delaiGrace" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "dureeRenouvellement" INTEGER,
ADD COLUMN     "jourLimitePaiement" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "penaliteMontant" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "penaliteRecurrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penaliteType" "PenaliteType" NOT NULL DEFAULT 'POURCENTAGE',
ADD COLUMN     "preavisNonRenouv" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "preavisResiliation" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "renouvellementAuto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seuilMiseEnDemeure" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "seuilSuspension" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "totalCharges" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMensuel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "paiements" ADD COLUMN     "montantCharges" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "montantLoyer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penalites" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDu" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "penalites" (
    "id" TEXT NOT NULL,
    "bailId" TEXT NOT NULL,
    "moisConcerne" TIMESTAMP(3) NOT NULL,
    "montant" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "appliqueLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "penalites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "penalites" ADD CONSTRAINT "penalites_bailId_fkey" FOREIGN KEY ("bailId") REFERENCES "baux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
