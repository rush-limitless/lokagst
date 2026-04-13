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

  // 4. Add reglementInterieur column to locataires if missing
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "locataires" ADD COLUMN IF NOT EXISTS "reglementInterieur" TEXT`);
    results.push("Colonne reglementInterieur ajoutée");
  } catch { results.push("Colonne reglementInterieur déjà présente"); }

  // 5. Fix orphan apartments: OCCUPE without any active bail → set to LIBRE
  const occupes = await prisma.appartement.findMany({ where: { statut: "OCCUPE" } });
  let fixed = 0;
  for (const a of occupes) {
    const bailActif = await prisma.bail.findFirst({ where: { appartementId: a.id, statut: "ACTIF" } });
    if (!bailActif) {
      await prisma.appartement.update({ where: { id: a.id }, data: { statut: "LIBRE" } });
      fixed++;
      results.push(`${a.numero} → LIBRE (pas de bail actif)`);
    }
  }
  if (fixed === 0) results.push("Aucun appartement orphelin");

  return NextResponse.json({ ok: true, results });
}
