import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // Helper: create paiements for a bail from start to end
  async function fillPaiements(bailId: string, loyer: number, charges: number, start: Date, end: Date) {
    const existing = await prisma.paiement.findMany({ where: { bailId }, select: { moisConcerne: true } });
    const existingSet = new Set(existing.map((p) => p.moisConcerne.toISOString().slice(0, 7)));
    let count = 0;
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (d <= endMonth) {
      if (!existingSet.has(d.toISOString().slice(0, 7))) {
        await prisma.paiement.create({
          data: { bailId, montant: loyer + charges, montantLoyer: loyer, montantCharges: charges, moisConcerne: new Date(d), datePaiement: new Date(d.getFullYear(), d.getMonth(), 5), modePaiement: "VIREMENT_BANCAIRE", statut: "PAYE", resteDu: 0, totalDu: loyer + charges },
        });
        count++;
      }
      d.setMonth(d.getMonth() + 1);
    }
    return count;
  }

  // === ATG 1 ===
  // Bail terminé (cmnm6fr9) a 0 paiements → créer juil 2023 à août 2025 avec 150k+7.5k
  const atg1OldBail = await prisma.bail.findFirst({ where: { id: { startsWith: "cmnm6fr9" } } });
  if (!atg1OldBail) {
    // Try by locataire name
    const atg1 = await prisma.locataire.findFirst({ where: { nom: { contains: "ATG 1", mode: "insensitive" } }, include: { baux: { orderBy: { dateDebut: "asc" } } } });
    if (atg1 && atg1.baux.length > 0) {
      const oldBail = atg1.baux[0];
      const n = await fillPaiements(oldBail.id, 150000, 7500, new Date(2023, 6, 1), new Date(2025, 7, 1));
      results.push(`ATG 1 ancien bail: ${n} paiements créés (juil 2023 → août 2025, 150k+7.5k)`);
    }
  } else {
    const n = await fillPaiements(atg1OldBail.id, 150000, 7500, new Date(2023, 6, 1), new Date(2025, 7, 1));
    results.push(`ATG 1 ancien bail: ${n} paiements créés (juil 2023 → août 2025, 150k+7.5k)`);
  }

  // === ATG 2 ===
  // Only has 1 bail (old one, still ACTIF) → need to:
  // 1. Terminate old bail, set fin to août 2025
  // 2. Create new bail sept 2025 → sept 2026 with 150k+15k, caution 450k
  // 3. Move paiements sept 2025+ to new bail and update montants
  // 4. Fill old bail paiements juil 2023 → août 2025
  const atg2 = await prisma.locataire.findFirst({
    where: { nom: { contains: "ATG 2", mode: "insensitive" } },
    include: { baux: { include: { paiements: true }, orderBy: { dateDebut: "asc" } } },
  });

  if (atg2) {
    const oldBail = atg2.baux[0];
    
    // Check if new bail already exists
    const hasNewBail = atg2.baux.length > 1;
    
    if (!hasNewBail) {
      // 1. Terminate old bail
      await prisma.bail.update({ where: { id: oldBail.id }, data: { statut: "TERMINE", dateFin: new Date(2025, 7, 31) } });
      results.push("ATG 2: ancien bail → TERMINÉ (fin août 2025)");

      // 2. Create new bail
      const newBail = await prisma.bail.create({
        data: {
          locataireId: atg2.id, appartementId: oldBail.appartementId,
          dateDebut: new Date(2025, 8, 1), dureeMois: 12, dateFin: new Date(2026, 8, 1),
          montantLoyer: 150000, montantCaution: 450000, cautionPayee: true,
          totalCharges: 15000, totalMensuel: 165000,
          chargesLocatives: [{ type: "Charges", montant: 15000 }],
          jourLimitePaiement: 5, periodicite: "MENSUEL", renouvellementAuto: true,
        },
      });
      results.push(`ATG 2: nouveau bail créé (sept 2025 → sept 2026, 150k+15k)`);

      // 3. Move paiements from sept 2025 onwards to new bail + update montants
      const sept2025 = new Date(2025, 8, 1);
      const toMove = oldBail.paiements.filter((p) => p.moisConcerne >= sept2025);
      for (const p of toMove) {
        await prisma.paiement.update({
          where: { id: p.id },
          data: { bailId: newBail.id, montantLoyer: 150000, montantCharges: 15000, montant: 165000 },
        });
      }
      results.push(`ATG 2: ${toMove.length} paiements déplacés vers nouveau bail (150k+15k)`);

      // 4. Fill old bail paiements
      const n = await fillPaiements(oldBail.id, 150000, 7500, new Date(2023, 6, 1), new Date(2025, 7, 1));
      results.push(`ATG 2 ancien bail: ${n} paiements créés (juil 2023 → août 2025, 150k+7.5k)`);
    } else {
      results.push("ATG 2: a déjà 2 baux, vérification...");
      // Just fill old bail if empty
      const n = await fillPaiements(oldBail.id, 150000, 7500, new Date(2023, 6, 1), new Date(2025, 7, 1));
      results.push(`ATG 2 ancien bail: ${n} paiements ajoutés`);
    }
  }

  return NextResponse.json({ ok: true, results });
}
