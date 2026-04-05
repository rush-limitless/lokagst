-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GESTIONNAIRE', 'LOCATAIRE');

-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('ACTIF', 'BLOQUE');

-- CreateEnum
CREATE TYPE "Etage" AS ENUM ('RDC', 'PREMIER', 'DEUXIEME', 'TROISIEME', 'QUATRIEME');

-- CreateEnum
CREATE TYPE "TypeAppartement" AS ENUM ('STUDIO', 'T2', 'T3', 'T4');

-- CreateEnum
CREATE TYPE "StatutAppartement" AS ENUM ('LIBRE', 'OCCUPE');

-- CreateEnum
CREATE TYPE "StatutLocataire" AS ENUM ('ACTIF', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "StatutBail" AS ENUM ('ACTIF', 'RESILIE', 'TERMINE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'MOBILE_MONEY', 'VIREMENT');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('PAYE', 'PARTIELLEMENT_PAYE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LOCATAIRE',
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'ACTIF',
    "tentativesEchouees" INTEGER NOT NULL DEFAULT 0,
    "bloqueJusqua" TIMESTAMP(3),
    "locataireId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appartements" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "etage" "Etage" NOT NULL,
    "type" "TypeAppartement" NOT NULL,
    "loyerBase" INTEGER NOT NULL,
    "description" TEXT,
    "statut" "StatutAppartement" NOT NULL DEFAULT 'LIBRE',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appartements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locataires" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "numeroCNI" TEXT,
    "photo" TEXT,
    "statut" "StatutLocataire" NOT NULL DEFAULT 'ACTIF',
    "dateEntree" TIMESTAMP(3) NOT NULL,
    "dateSortie" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locataires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baux" (
    "id" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "appartementId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dureeMois" INTEGER NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "montantLoyer" INTEGER NOT NULL,
    "montantCaution" INTEGER NOT NULL,
    "statut" "StatutBail" NOT NULL DEFAULT 'ACTIF',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "bailId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "moisConcerne" TIMESTAMP(3) NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modePaiement" "ModePaiement" NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'PAYE',
    "resteDu" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_locataireId_key" ON "utilisateurs"("locataireId");

-- CreateIndex
CREATE UNIQUE INDEX "appartements_numero_key" ON "appartements"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "locataires_email_key" ON "locataires"("email");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_bailId_moisConcerne_key" ON "paiements"("bailId", "moisConcerne");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baux" ADD CONSTRAINT "baux_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baux" ADD CONSTRAINT "baux_appartementId_fkey" FOREIGN KEY ("appartementId") REFERENCES "appartements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_bailId_fkey" FOREIGN KEY ("bailId") REFERENCES "baux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
