import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // Get ALL baux with their paiements
  const allBaux = await prisma.bail.findMany({
    include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: { orderBy: { moisConcerne: "asc" } } },
    orderBy: { dateDebut: "asc" },
  });

  // Group baux by locataire+appartement
  const groups = new Map<string, typeof allBaux>();
  for (const b of allBaux) {
    const key = `${b.locataireId}_${b.appartementId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(b);
  }

  for (const [key, baux] of Array.from(groups)) {
    if (baux.length < 2) continue; // Only fix locataires with multiple baux

    const sorted = baux.sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime());
    const locName = `${sorted[0].locataire.prenom} ${sorted[0].locataire.nom}`;
    const appart = sorted[0].appartement.numero;

    for (let i = 0; i < sorted.length; i++) {
      const bail = sorted[i];
      const isLast = i === sorted.length - 1;

      // Ensure only the most recent bail is ACTIF
      if (!isLast && bail.statut === "ACTIF") {
        await prisma.bail.update({ where: { id: bail.id }, data: { statut: "TERMINE" } });
        results.push(`${locName} (${appart}): bail ${bail.dateDebut.toISOString().slice(0, 7)} → TERMINÉ`);
      }

      // Fix paiements: update montantLoyer and montantCharges to match THIS bail's values
      const bailStart = new Date(bail.dateDebut.getFullYear(), bail.dateDebut.getMonth(), 1);
      const bailEnd = new Date(bail.dateFin.getFullYear(), bail.dateFin.getMonth(), 1);

      let fixedCount = 0;
      for (const p of bail.paiements) {
        const needsFix = p.montantLoyer !== bail.montantLoyer || p.montantCharges !== bail.totalCharges;
        if (needsFix) {
          const newMontant = bail.montantLoyer + bail.totalCharges;
          await prisma.paiement.update({
            where: { id: p.id },
            data: {
              montantLoyer: bail.montantLoyer,
              montantCharges: bail.totalCharges,
              montant: newMontant,
              totalDu: bail.totalMensuel,
              resteDu: 0,
              statut: "PAYE",
            },
          });
          fixedCount++;
        }
      }

      if (fixedCount > 0) {
        results.push(`${locName} (${appart}): bail ${bail.dateDebut.toISOString().slice(0, 7)}→${bail.dateFin.toISOString().slice(0, 7)} — ${fixedCount} paiement(s) corrigé(s) (loyer=${bail.montantLoyer}, charges=${bail.totalCharges})`);
      }
    }
  }

  // Also fix ALL paiements where montantLoyer=0 (old seed data) — set to bail values
  const zeroLoyer = await prisma.paiement.findMany({
    where: { montantLoyer: 0 },
    include: { bail: { select: { montantLoyer: true, totalCharges: true, totalMensuel: true } } },
  });

  let zeroFixed = 0;
  for (const p of zeroLoyer) {
    await prisma.paiement.update({
      where: { id: p.id },
      data: {
        montantLoyer: p.bail.montantLoyer,
        montantCharges: p.bail.totalCharges,
        montant: p.bail.totalMensuel,
        totalDu: p.bail.totalMensuel,
        resteDu: 0,
        statut: "PAYE",
      },
    });
    zeroFixed++;
  }
  if (zeroFixed > 0) results.push(`${zeroFixed} paiement(s) avec loyer=0 corrigé(s) avec les valeurs du bail`);

  return NextResponse.json({ ok: true, results });
}
