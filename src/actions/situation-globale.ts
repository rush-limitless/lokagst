"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getSituationGlobale() {
  const now = new Date();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: { select: { id: true, nom: true, prenom: true, photo: true } }, appartement: { select: { numero: true, etage: true } }, paiements: true },
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
      const paiement = b.paiements.find((p) => new Date(p.moisConcerne).getMonth() === d.getMonth() && new Date(p.moisConcerne).getFullYear() === d.getFullYear());
      const montantPaye = paiement?.montant || 0;

      if (echeance) {
        const freq = PERIODICITE_MOIS[b.periodicite] || 1;
        const loyerAttendu = b.montantLoyer * freq;
        const chargesAttendues = b.totalCharges * freq;
        const totalAttendu = loyerAttendu + chargesAttendues;
        const loyerPaye = montantPaye >= loyerAttendu;
        const chargesPaye = montantPaye >= totalAttendu;

        if (!loyerPaye) { moisLoyerImpayes++; montantLoyerDu += loyerAttendu - Math.min(montantPaye, loyerAttendu); }
        if (!chargesPaye && b.totalCharges > 0) { moisChargesImpayes++; montantChargesDu += chargesAttendues - Math.max(0, montantPaye - loyerAttendu); }

        detailMois.push({ mois: moisLabel, loyerPaye, chargesPaye, montantPaye, echeance: true });
      } else {
        // Mois non-échéance : pas d'attendu, considéré comme "à jour"
        detailMois.push({ mois: moisLabel, loyerPaye: true, chargesPaye: true, montantPaye, echeance: false });
      }
      d.setMonth(d.getMonth() + 1);
    }

    const totalDu = montantLoyerDu + montantChargesDu;
    const aJour = totalDu === 0;

    return {
      locataireId: b.locataire.id,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      photo: b.locataire.photo,
      appartement: b.appartement.numero,
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
    };
  }).sort((a, b) => a.locataire.localeCompare(b.locataire, "fr"));
}
