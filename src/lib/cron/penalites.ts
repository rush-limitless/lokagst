import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import type { BailComplet } from "./types";

export async function traiterPenalites(bail: BailComplet, jour: number, moisCourant: Date, estPaye: boolean) {
  if (estPaye || jour <= bail.jourLimitePaiement + bail.delaiGrace) return 0;

  const dejaAppliquee = bail.penalites.some((p) => { const mc = new Date(p.moisConcerne); return mc.getMonth() === moisCourant.getMonth() && mc.getFullYear() === moisCourant.getFullYear(); });
  const semainesRetard = Math.floor((jour - bail.jourLimitePaiement - bail.delaiGrace) / 7);
  const nbPenalitesMois = bail.penalites.filter((p) => { const mc = new Date(p.moisConcerne); return mc.getMonth() === moisCourant.getMonth() && mc.getFullYear() === moisCourant.getFullYear(); }).length;

  if (!dejaAppliquee || (bail.penaliteRecurrente && semainesRetard > nbPenalitesMois)) {
    const montant = bail.penaliteType === "POURCENTAGE" ? Math.round(bail.montantLoyer * bail.penaliteMontant / 100) : bail.penaliteMontant;
    await prisma.penalite.create({ data: { bailId: bail.id, moisConcerne: moisCourant, montant, motif: `Retard de paiement — Semaine ${semainesRetard || 1}` } });
    if (bail.locataire.email) {
      const sujet = `Pénalité de retard — ${montant.toLocaleString()} FCFA`;
      const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Une pénalité de <strong>${montant.toLocaleString()} FCFA</strong> a été appliquée pour le mois en cours.</p>`;
      try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "NOTIFICATION_PENALITE", sujet, contenu, destinataire: bail.locataire.email } }); } catch {}
    }
    return 1;
  }
  return 0;
}
