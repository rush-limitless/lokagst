import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // 1. Add AUTRE to Etage enum + SALLE_CONFERENCE to TypeAppartement enum (idempotent)
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Etage" ADD VALUE IF NOT EXISTS 'AUTRE'`);
    results.push("Enum Etage: AUTRE ajouté");
  } catch { results.push("Enum Etage: AUTRE déjà présent"); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "TypeAppartement" ADD VALUE IF NOT EXISTS 'SALLE_CONFERENCE'`);
    results.push("Enum TypeAppartement: SALLE_CONFERENCE ajouté");
  } catch { results.push("Enum TypeAppartement: SALLE_CONFERENCE déjà présent"); }

  // 2. Déplacer APPART MEUBLE au 5ème
  const meuble = await prisma.appartement.findFirst({ where: { numero: "APPART MEUBLE" } });
  if (meuble && meuble.etage !== "CINQUIEME") {
    await prisma.appartement.update({ where: { id: meuble.id }, data: { etage: "CINQUIEME" } });
    results.push("APPART MEUBLE déplacé au 5ème");
  } else if (meuble) {
    results.push("APPART MEUBLE déjà au 5ème");
  }

  // 3. Créer SALLE DE CONFERENCE au 5ème
  const salle = await prisma.appartement.findFirst({ where: { numero: { in: ["SALLE DE CONFERENCE", "SALLE DE REUNION"] } } });
  if (!salle) {
    const imm = await prisma.immeuble.findFirst({ where: { nom: { contains: "Tchang" } } });
    if (imm) {
      await prisma.appartement.create({
        data: { numero: "SALLE DE CONFERENCE", etage: "CINQUIEME", type: "SALLE_CONFERENCE", loyerBase: 0, immeubleId: imm.id },
      });
      results.push("SALLE DE CONFERENCE créée au 5ème");
    }
  } else if (salle.numero === "SALLE DE REUNION") {
    await prisma.appartement.update({ where: { id: salle.id }, data: { numero: "SALLE DE CONFERENCE", type: "SALLE_CONFERENCE" } });
    results.push("Renommée en SALLE DE CONFERENCE");
  } else {
    results.push("SALLE DE CONFERENCE existe déjà");
  }

  return NextResponse.json({ ok: true, results });
}
