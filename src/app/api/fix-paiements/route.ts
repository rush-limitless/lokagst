export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // 1. Fix moisConcerne: set to 1st of the month of datePaiement
  const paiements = await prisma.paiement.findMany({
    select: { id: true, datePaiement: true, moisConcerne: true, bailId: true, montant: true },
    orderBy: { datePaiement: "asc" },
  });

  let fixed = 0;
  for (const p of paiements) {
    const correctMois = new Date(p.datePaiement.getFullYear(), p.datePaiement.getMonth(), 1);
    if (p.moisConcerne.getTime() !== correctMois.getTime()) {
      await prisma.paiement.update({ where: { id: p.id }, data: { moisConcerne: correctMois } });
      fixed++;
    }
  }
  results.push(`${fixed} paiement(s) corrigé(s) (moisConcerne = 1er du mois de datePaiement)`);

  // 2. Remove duplicates: keep only the first payment per bail+moisConcerne
  const allPaiements = await prisma.paiement.findMany({
    select: { id: true, bailId: true, moisConcerne: true, montant: true, creeLe: true },
    orderBy: { creeLe: "asc" },
  });

  const seen = new Map<string, string>(); // key: bailId+mois -> first paiement id
  const toDelete: string[] = [];

  for (const p of allPaiements) {
    const key = `${p.bailId}_${p.moisConcerne.toISOString().slice(0, 7)}`;
    if (seen.has(key)) {
      toDelete.push(p.id);
    } else {
      seen.set(key, p.id);
    }
  }

  if (toDelete.length > 0) {
    await prisma.paiement.deleteMany({ where: { id: { in: toDelete } } });
    results.push(`${toDelete.length} doublon(s) supprimé(s)`);
  } else {
    results.push("Aucun doublon trouvé");
  }

  results.push(`Total paiements restants: ${allPaiements.length - toDelete.length}`);

  return NextResponse.json({ ok: true, results });
}
