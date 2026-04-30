export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // Helper: find locataire by name pattern
  async function findLoc(nom: string) {
    return prisma.locataire.findFirst({ where: { nom: { contains: nom, mode: "insensitive" } }, include: { baux: { include: { paiements: true }, orderBy: { creeLe: "asc" } } } });
  }

  // Helper: ensure paiements exist up to a target month
  async function ensurePaiements(bailId: string, loyer: number, charges: number, startDate: Date, endMonth: Date) {
    const existing = await prisma.paiement.findMany({ where: { bailId }, select: { moisConcerne: true } });
    const existingMonths = new Set(existing.map((p) => p.moisConcerne.toISOString().slice(0, 7)));
    let created = 0;
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (d <= endMonth) {
      const key = d.toISOString().slice(0, 7);
      if (!existingMonths.has(key)) {
        await prisma.paiement.create({
          data: {
            bailId, montant: loyer + charges, montantLoyer: loyer, montantCharges: charges,
            moisConcerne: new Date(d), datePaiement: new Date(d.getFullYear(), d.getMonth(), 5),
            modePaiement: "VIREMENT_BANCAIRE", statut: "PAYE", resteDu: 0, totalDu: loyer + charges,
          },
        });
        created++;
      }
      d.setMonth(d.getMonth() + 1);
    }
    return created;
  }

  // === ATG 1 ===
  const atg1 = await findLoc("ATG 1");
  if (atg1 && atg1.baux.length >= 2) {
    // Terminate oldest bail, keep newest active
    const sorted = atg1.baux.sort((a, b) => a.creeLe.getTime() - b.creeLe.getTime());
    const oldBail = sorted[0];
    const newBail = sorted[sorted.length - 1];
    if (oldBail.id !== newBail.id && oldBail.statut === "ACTIF") {
      await prisma.bail.update({ where: { id: oldBail.id }, data: { statut: "TERMINE" } });
      results.push(`ATG 1: ancien bail ${oldBail.id.slice(0, 8)} → TERMINÉ`);
    }
    // Ensure paiements up to April 2026 on active bail
    const created = await ensurePaiements(newBail.id, newBail.montantLoyer, newBail.totalCharges, newBail.dateDebut, new Date(2026, 3, 1));
    results.push(`ATG 1: ${created} paiement(s) ajouté(s) jusqu'en avril 2026 (bail actif: loyer=${newBail.montantLoyer}, charges=${newBail.totalCharges})`);
  } else {
    results.push(`ATG 1: ${atg1 ? atg1.baux.length + " bail(s)" : "non trouvé"}`);
  }

  // === ATG 2 ===
  const atg2 = await findLoc("ATG 2");
  if (atg2 && atg2.baux.length >= 2) {
    const sorted = atg2.baux.sort((a, b) => a.creeLe.getTime() - b.creeLe.getTime());
    const oldBail = sorted[0];
    const newBail = sorted[sorted.length - 1];
    if (oldBail.id !== newBail.id && oldBail.statut === "ACTIF") {
      await prisma.bail.update({ where: { id: oldBail.id }, data: { statut: "TERMINE" } });
      results.push(`ATG 2: ancien bail ${oldBail.id.slice(0, 8)} → TERMINÉ`);
    }
    const created = await ensurePaiements(newBail.id, newBail.montantLoyer, newBail.totalCharges, newBail.dateDebut, new Date(2026, 3, 1));
    results.push(`ATG 2: ${created} paiement(s) ajouté(s) jusqu'en avril 2026`);
  } else {
    results.push(`ATG 2: ${atg2 ? atg2.baux.length + " bail(s)" : "non trouvé"}`);
  }

  // === LINE ESSOUKA — payé jusqu'en mai 2026 ===
  const line = await findLoc("ESSOUKA");
  if (line) {
    const activeBail = line.baux.find((b) => b.statut === "ACTIF");
    if (activeBail) {
      const created = await ensurePaiements(activeBail.id, activeBail.montantLoyer, activeBail.totalCharges, activeBail.dateDebut, new Date(2026, 4, 1));
      results.push(`LINE ESSOUKA: ${created} paiement(s) ajouté(s) jusqu'en mai 2026 (loyer=${activeBail.montantLoyer}, charges=${activeBail.totalCharges})`);
    } else {
      results.push("LINE ESSOUKA: pas de bail actif");
    }
  } else {
    results.push("LINE ESSOUKA: non trouvée");
  }

  return NextResponse.json({ ok: true, results });
}
