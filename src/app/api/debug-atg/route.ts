import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const atg1 = await prisma.locataire.findFirst({
    where: { nom: { contains: "ATG 1", mode: "insensitive" } },
    include: { baux: { include: { paiements: { orderBy: { moisConcerne: "asc" } } }, orderBy: { dateDebut: "asc" } } },
  });

  const atg2 = await prisma.locataire.findFirst({
    where: { nom: { contains: "ATG 2", mode: "insensitive" } },
    include: { baux: { include: { paiements: { orderBy: { moisConcerne: "asc" } } }, orderBy: { dateDebut: "asc" } } },
  });

  function summarize(loc: typeof atg1) {
    if (!loc) return "non trouvé";
    return loc.baux.map((b) => ({
      bailId: b.id.slice(0, 8),
      statut: b.statut,
      debut: b.dateDebut.toISOString().slice(0, 10),
      fin: b.dateFin.toISOString().slice(0, 10),
      loyer: b.montantLoyer,
      charges: b.totalCharges,
      caution: b.montantCaution,
      nbPaiements: b.paiements.length,
      premiers3: b.paiements.slice(0, 3).map((p) => ({ mois: p.moisConcerne.toISOString().slice(0, 7), loyer: p.montantLoyer, charges: p.montantCharges, total: p.montant })),
      derniers3: b.paiements.slice(-3).map((p) => ({ mois: p.moisConcerne.toISOString().slice(0, 7), loyer: p.montantLoyer, charges: p.montantCharges, total: p.montant })),
    }));
  }

  return NextResponse.json({ ATG1: summarize(atg1), ATG2: summarize(atg2) });
}
