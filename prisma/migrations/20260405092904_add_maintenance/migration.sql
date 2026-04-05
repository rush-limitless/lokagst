-- CreateEnum
CREATE TYPE "StatutMaintenance" AS ENUM ('SIGNALE', 'EN_COURS', 'RESOLU');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'NORMALE', 'URGENTE');

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "appartementId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[],
    "statut" "StatutMaintenance" NOT NULL DEFAULT 'SIGNALE',
    "priorite" "Priorite" NOT NULL DEFAULT 'NORMALE',
    "technicien" TEXT,
    "commentaire" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_appartementId_fkey" FOREIGN KEY ("appartementId") REFERENCES "appartements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
