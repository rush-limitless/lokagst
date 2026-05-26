"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getSituationGlobale() {
  const now = new Date();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: { select: { id: true, nom: true, prenom: true, photo: true } }, appartement: { select: { numero: true, etage: true, immeuble: { select: { nom: true } } } }, paiements: true },
    orderBy: [{ locataire: { nom: "asc" } }, { locataire: { prenom: "asc" } }],
  });

  return bauxActifs.map((b) => {
    const debut = new Date(b.dateDebut);
    let moisLoyerImpayes = 0;
    let montantLoyerDu = 0;
    let moisChargesImpayes = 0;
    let montantChargesDu = 0;
    const detailMois: { mois: string; loyerPaye: boolean; chargesPaye: boolean; montantPaye: number; echeance: boolean }[] = [];

    const d = new Date(debut.getFullYear(), debut.getMonth(), 1);
    while (d <= now) {
      const moisLabel = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      const echeance = isMoisEcheance(d, debut, b.periodicite);
      const freq = PERIODICITE_MOIS[b.periodicite] || 1;

      // Sommer tous les paiements de la période d'échéance (d → d+freq mois)
      const periodeDebut = new Date(d);
      const periodeFin = new Date(d.getFullYear(), d.getMonth() + freq, 1);
      const montantPaye = echeance
        ? b.paiements
            .filter((p) => {
              const mc = new Date(p.moisConcerne);
              const moisP = new Date(mc.getFullYear(), mc.getMonth(), 1);
              return moisP >= periodeDebut && moisP < periodeFin;
            })
            .reduce((s, p) => s + p.montant - (p.montantCaution || 0), 0)
        : (b.paiements.find((p) => {
            const mc = new Date(p.moisConcerne);
            return mc.getMonth() === d.getMonth() && mc.getFullYear() === d.getFullYear();
          })?.montant || 0);

      if (echeance) {
        const loyerAttendu = b.montantLoyer * freq;
        const chargesAttendues = b.totalCharges * freq;
        const totalAttendu = loyerAttendu + chargesAttendues;
        const loyerPaye = montantPaye >= loyerAttendu;
        const chargesPaye = montantPaye >= totalAttendu;

        if (!loyerPaye) { moisLoyerImpayes++; montantLoyerDu += loyerAttendu - Math.min(montantPaye, loyerAttendu); }
        if (!chargesPaye && b.totalCharges > 0) {
          moisChargesImpayes++;
          // Ce que le locataire a payé en charges = ce qui reste après avoir couvert le loyer (0 si loyer pas couvert)
          const payePourCharges = montantPaye > loyerAttendu ? montantPaye - loyerAttendu : 0;
          montantChargesDu += chargesAttendues - Math.min(payePourCharges, chargesAttendues);
        }

        detailMois.push({ mois: moisLabel, loyerPaye, chargesPaye, montantPaye, echeance: true });
      } else {
        // Mois non-échéance : pas d'attendu, considéré comme "à jour"
        const montantPayeMois = b.paiements.find((p) => {
          const mc = new Date(p.moisConcerne);
          return mc.getMonth() === d.getMonth() && mc.getFullYear() === d.getFullYear();
        })?.montant || 0;
        detailMois.push({ mois: moisLabel, loyerPaye: true, chargesPaye: true, montantPaye: montantPayeMois, echeance: false });
      }
      d.setMonth(d.getMonth() + 1);
    }

    const totalDu = montantLoyerDu + montantChargesDu;
    const aJour = totalDu === 0;

    // Dernier paiement enregistré
    const dernierPaiement = b.paiements.length > 0
      ? b.paiements.reduce((latest, p) => new Date(p.datePaiement) > new Date(latest.datePaiement) ? p : latest)
      : null;

    return {
      locataireId: b.locataire.id,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      photo: b.locataire.photo,
      appartement: b.appartement.numero,
      immeuble: b.appartement.immeuble?.nom || "Sans immeuble",
      etage: b.appartement.etage,
      loyerMensuel: b.montantLoyer,
      chargesMensuelles: b.totalCharges,
      totalMensuel: b.totalMensuel,
      periodicite: b.periodicite,
      moisLoyerImpayes,
      montantLoyerDu,
      moisChargesImpayes,
      montantChargesDu,
      totalDu,
      aJour,
      detailMois: detailMois.slice(-12),
      statut: b.statut,
      dernierPaiement: dernierPaiement ? { date: dernierPaiement.datePaiement, montant: dernierPaiement.montant } : null,
    };
  }); // already sorted by immeuble/etage from DB
}
