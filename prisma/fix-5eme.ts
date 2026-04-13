import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Déplacer APPART MEUBLE au 5ème s'il est au 4ème
  const meuble = await prisma.appartement.findFirst({ where: { numero: "APPART MEUBLE" } });
  if (meuble && meuble.etage !== "CINQUIEME") {
    await prisma.appartement.update({ where: { id: meuble.id }, data: { etage: "CINQUIEME" } });
    console.log("APPART MEUBLE déplacé au 5ème étage");
  } else if (meuble) {
    console.log("APPART MEUBLE déjà au 5ème");
  } else {
    console.log("APPART MEUBLE non trouvé");
  }

  // 2. Créer SALLE DE CONFERENCE au 5ème si elle n'existe pas
  const salle = await prisma.appartement.findFirst({ where: { numero: { in: ["SALLE DE CONFERENCE", "SALLE DE REUNION"] } } });
  if (!salle) {
    const imm = await prisma.immeuble.findFirst({ where: { nom: { contains: "Tchang" } } });
    if (imm) {
      await prisma.appartement.create({
        data: { numero: "SALLE DE CONFERENCE", etage: "CINQUIEME", type: "SALLE_CONFERENCE", loyerBase: 0, immeubleId: imm.id },
      });
      console.log("SALLE DE CONFERENCE créée au 5ème");
    }
  } else if (salle.numero === "SALLE DE REUNION") {
    await prisma.appartement.update({ where: { id: salle.id }, data: { numero: "SALLE DE CONFERENCE", type: "SALLE_CONFERENCE" } });
    console.log("SALLE DE REUNION renommée en SALLE DE CONFERENCE");
  } else {
    console.log("SALLE DE CONFERENCE existe déjà");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
