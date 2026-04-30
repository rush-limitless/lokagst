export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // Map: appartement numero → dernier mois payé (1er du mois)
  const updates: { appart: string; payeJusqua: Date }[] = [
    { appart: "RDC GAB", payeJusqua: new Date(2026, 9, 1) },       // GAB → oct 2026
    { appart: "RDC IT", payeJusqua: new Date(2026, 11, 1) },       // IT → déc 2026
    { appart: "STUDIO B01", payeJusqua: new Date(2026, 0, 1) },    // Ghislain → jan 2026
    { appart: "APPART A12", payeJusqua: new Date(2026, 4, 1) },    // Line Essouka → mai 2026
    { appart: "APPART B13", payeJusqua: new Date(2026, 7, 1) },    // ATG 1 → août 2026
    { appart: "APPART B14", payeJusqua: new Date(2026, 7, 1) },    // ATG 2 → août 2026
    { appart: "APPART A21", payeJusqua: new Date(2025, 11, 1) },   // TMCO → déc 2025
    { appart: "APPART A22", payeJusqua: new Date(2026, 4, 1) },    // → mai 2026
    { appart: "APPART B23", payeJusqua: new Date(2026, 4, 1) },    // Line Essouka B23 → mai 2026
    { appart: "APPART B24", payeJusqua: new Date(2027, 2, 1) },    // → mars 2027
    { appart: "STUDIO A31", payeJusqua: new Date(2026, 3, 1) },    // → avril 2026
    { appart: "STUDIO A32", payeJusqua: new Date(2026, 3, 1) },    // → avril 2026
    { appart: "CHAMBRE A33", payeJusqua: new Date(2026, 1, 1) },   // → fév 2026
    { appart: "CHAMBRE A34", payeJusqua: new Date(2026, 2, 1) },   // → mars 2026
    { appart: "CHAMBRE B35", payeJusqua: new Date(2026, 1, 1) },   // → fév 2026
    { appart: "CHAMBRE B36", payeJusqua: new Date(2026, 3, 1) },   // → avril 2026
    { appart: "STUDIO B37", payeJusqua: new Date(2026, 1, 1) },    // → fév 2026
    { appart: "STUDIO B38", payeJusqua: new Date(2026, 2, 1) },    // → mars 2026
    { appart: "STUDIO A41", payeJusqua: new Date(2026, 3, 1) },    // → avril 2026
    { appart: "STUDIO A42", payeJusqua: new Date(2026, 2, 1) },    // → mars 2026
    { appart: "CHAMBRE B44", payeJusqua: new Date(2026, 2, 1) },   // → mars 2026
    { appart: "CHAMBRE B45", payeJusqua: new Date(2026, 2, 1) },   // → mars 2026
    { appart: "CHAMBRE B46", payeJusqua: new Date(2026, 1, 1) },   // → fév 2026
    { appart: "STUDIO B47", payeJusqua: new Date(2026, 5, 1) },    // → juin 2026
    { appart: "STUDIO B48", payeJusqua: new Date(2026, 4, 1) },    // → mai 2026
    { appart: "RDC SB", payeJusqua: new Date(2026, 5, 1) },        // → juin 2026
    { appart: "ETAGE SB", payeJusqua: new Date(2026, 2, 1) },      // → mars 2026
  ];

  for (const { appart, payeJusqua } of updates) {
    // Find the active bail for this apartment
    const bail = await prisma.bail.findFirst({
      where: { appartement: { numero: appart }, statut: "ACTIF" },
      include: { locataire: { select: { nom: true, prenom: true } }, paiements: { select: { moisConcerne: true } } },
    });

    if (!bail) {
      results.push(`❌ ${appart}: pas de bail actif`);
      continue;
    }

    const existingMonths = new Set(bail.paiements.map((p) => p.moisConcerne.toISOString().slice(0, 7)));
    const loyer = bail.montantLoyer;
    const charges = bail.totalCharges;
    let created = 0;

    // Create paiements from bail start to payeJusqua
    const d = new Date(bail.dateDebut.getFullYear(), bail.dateDebut.getMonth(), 1);
    while (d <= payeJusqua) {
      const key = d.toISOString().slice(0, 7);
      if (!existingMonths.has(key)) {
        await prisma.paiement.create({
          data: {
            bailId: bail.id,
            montant: loyer + charges,
            montantLoyer: loyer,
            montantCharges: charges,
            moisConcerne: new Date(d),
            datePaiement: new Date(d.getFullYear(), d.getMonth(), 5),
            modePaiement: "VIREMENT_BANCAIRE",
            statut: "PAYE",
            resteDu: 0,
            totalDu: loyer + charges,
          },
        });
        created++;
      }
      d.setMonth(d.getMonth() + 1);
    }

    const locName = `${bail.locataire.prenom} ${bail.locataire.nom}`;
    results.push(`✅ ${appart} (${locName}): ${created} paiement(s) ajouté(s) → ${payeJusqua.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} [${loyer}+${charges}=${loyer + charges}]`);
  }

  return NextResponse.json({ ok: true, results });
}
