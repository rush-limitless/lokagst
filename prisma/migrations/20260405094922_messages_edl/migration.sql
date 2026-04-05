-- CreateEnum
CREATE TYPE "ExpMessage" AS ENUM ('GESTIONNAIRE', 'LOCATAIRE');

-- CreateEnum
CREATE TYPE "TypeEDL" AS ENUM ('ENTREE', 'SORTIE');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "expediteur" "ExpMessage" NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etats_des_lieux" (
    "id" TEXT NOT NULL,
    "bailId" TEXT NOT NULL,
    "type" "TypeEDL" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pieces" JSONB NOT NULL DEFAULT '[]',
    "observations" TEXT,
    "photos" TEXT[],
    "signatureLocataire" TEXT,
    "signatureGestionnaire" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etats_des_lieux_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_des_lieux" ADD CONSTRAINT "etats_des_lieux_bailId_fkey" FOREIGN KEY ("bailId") REFERENCES "baux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
