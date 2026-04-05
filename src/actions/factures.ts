"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function envoyerFacturesMensuelles() {
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: true, appartement: true },
  });

  const moisLabel = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  let envoyes = 0;

  for (const bail of bauxActifs) {
    if (!bail.locataire.email) continue;

    const charges = (bail.chargesLocatives as { type: string; montant: number }[]) || [];
    const chargesHtml = charges.length > 0
      ? charges.map((c) => `<tr><td style="padding:4px 8px;color:#666">${c.type}</td><td style="padding:4px 8px;text-align:right">${c.montant.toLocaleString("fr-FR")} FCFA</td></tr>`).join("")
      : "";

    const sujet = `Facture de loyer — ${moisLabel}`;
    const contenu = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#003366;color:white;padding:20px;text-align:center">
          <h1 style="margin:0">FINSTAR</h1>
          <p style="margin:5px 0 0;opacity:0.8">Facture de loyer</p>
        </div>
        <div style="padding:20px;border:1px solid #eee">
          <p>Bonjour <strong>${bail.locataire.prenom} ${bail.locataire.nom}</strong>,</p>
          <p>Veuillez trouver ci-dessous votre facture pour le mois de <strong>${moisLabel}</strong> :</p>
          <table style="width:100%;border-collapse:collapse;margin:15px 0">
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Appartement</td><td style="padding:8px;text-align:right;font-weight:bold">${bail.appartement.numero}</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Loyer</td><td style="padding:8px;text-align:right;font-weight:bold">${bail.montantLoyer.toLocaleString("fr-FR")} FCFA</td></tr>
            ${chargesHtml}
            ${bail.totalCharges > 0 ? `<tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666;font-weight:bold">Total charges</td><td style="padding:8px;text-align:right;font-weight:bold">${bail.totalCharges.toLocaleString("fr-FR")} FCFA</td></tr>` : ""}
            <tr style="background:#f0f9ff"><td style="padding:12px 8px;font-weight:bold;font-size:16px">TOTAL À PAYER</td><td style="padding:12px 8px;text-align:right;font-weight:bold;font-size:16px;color:#003366">${bail.totalMensuel.toLocaleString("fr-FR")} FCFA</td></tr>
          </table>
          <p style="color:#666">Date limite de paiement : <strong>le ${bail.jourLimitePaiement} ${moisLabel}</strong></p>
          <p style="color:#999;font-size:12px">En cas de retard, une pénalité de ${bail.penaliteMontant}${bail.penaliteType === "POURCENTAGE" ? "%" : " FCFA"} sera appliquée après ${bail.delaiGrace} jours de grâce.</p>
          <p>Cordialement,<br><strong>La gestion FINSTAR</strong></p>
        </div>
      </div>`;

    try {
      await sendEmail(bail.locataire.email, sujet, contenu);
      await prisma.emailLog.create({
        data: { locataireId: bail.locataireId, type: "RAPPEL_ECHEANCE", sujet, contenu, destinataire: bail.locataire.email },
      });
      envoyes++;
    } catch {}
  }

  return { success: true, envoyes };
}
