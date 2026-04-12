-- CreateEnum
CREATE TYPE "CategorieDepense" AS ENUM ('TRAVAUX', 'ENTRETIEN', 'ASSURANCE', 'TAXE_FONCIERE', 'EAU_ELECTRICITE', 'FRAIS_GESTION', 'AUTRE');

-- CreateTable
CREATE TABLE "depenses" (
    "id" TEXT NOT NULL,
    "immeubleId" TEXT,
    "categorie" "CategorieDepense" NOT NULL,
    "description" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fournisseur" TEXT,
    "reference" TEXT,
    "justificatif" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depenses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_immeubleId_fkey" FOREIGN KEY ("immeubleId") REFERENCES "immeubles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
