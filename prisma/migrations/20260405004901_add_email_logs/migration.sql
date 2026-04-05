-- CreateEnum
CREATE TYPE "TypeEmail" AS ENUM ('RAPPEL_PAIEMENT', 'RECU_PAIEMENT', 'EXPIRATION_BAIL');

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "type" "TypeEmail" NOT NULL,
    "sujet" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "envoyeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
