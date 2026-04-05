-- AlterTable
ALTER TABLE "appartements" ADD COLUMN     "immeubleId" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "utilisateur" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "details" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immeubles" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "quartier" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immeubles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appartements" ADD CONSTRAINT "appartements_immeubleId_fkey" FOREIGN KEY ("immeubleId") REFERENCES "immeubles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
