"use server";

import { prisma } from "@/lib/prisma";

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
    const detailMois: { mois: string; loyerPaye: boolean; chargesPaye: boolean; montantPaye: number }[] = [];

    // Parcourir chaque mois depuis le début du bail
    const d = new Date(debut.getFullYear(), debut.getMonth(), 1);
    while (d <= now) {
      const moisLabel = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      const paiement = b.paiements.find((p) => new Date(p.moisConcerne).getMonth() === d.getMonth() && new Date(p.moisConcerne).getFullYear() === d.getFullYear());
      const montantPaye = paiement?.montant || 0;
      const loyerPaye = montantPaye >= b.montantLoyer;
      const chargesPaye = montantPaye >= b.totalMensuel;

      if (!loyerPaye) { moisLoyerImpayes++; montantLoyerDu += b.montantLoyer - Math.min(montantPaye, b.montantLoyer); }
      if (!chargesPaye && b.totalCharges > 0) { moisChargesImpayes++; montantChargesDu += b.totalCharges - Math.max(0, montantPaye - b.montantLoyer); }

      detailMois.push({ mois: moisLabel, loyerPaye, chargesPaye, montantPaye });
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
      moisLoyerImpayes,
      montantLoyerDu,
      moisChargesImpayes,
      montantChargesDu,
      totalDu,
      aJour,
      detailMois: detailMois.slice(-12), // 12 derniers mois
      statut: b.statut,
    };
  }).sort((a, b) => b.totalDu - a.totalDu);
}
