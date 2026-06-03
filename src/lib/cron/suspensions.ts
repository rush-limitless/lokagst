import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import type { BailComplet } from "./types";

export async function traiterSuspensions(bail: BailComplet, now: Date) {
  let moisImpayes = 0;
  for (let i = 0; i < 6; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const p = bail.paiements.find((pay) => { const mc = new Date(pay.moisConcerne); return mc.getMonth() === m.getMonth() && mc.getFullYear() === m.getFullYear(); });
    if (!p || p.statut !== "PAYE") moisImpayes++;
    else break;
  }

  let misesDemeure = 0, suspensions = 0;
  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);

  if (moisImpayes >= bail.seuilMiseEnDemeure && moisImpayes < bail.seuilSuspension) {
    const dejaEnvoyee = await prisma.emailLog.findFirst({ where: { locataireId: bail.locataireId, type: "MISE_EN_DEMEURE", envoyeLe: { gte: moisCourant } } });
    if (!dejaEnvoyee && bail.locataire.email) {
      const totalDu = moisImpayes * bail.totalMensuel + bail.penalites.filter((p) => !p.payee).reduce((s, p) => s + p.montant, 0);
      const sujet = `MISE EN DEMEURE — ${moisImpayes} mois d'impayés`;
      const contenu = `<div style="font-family:Arial;max-width:600px;margin:0 auto;border:2px solid red;padding:20px"><h2 style="color:red">MISE EN DEMEURE</h2><p>Monsieur/Madame ${bail.locataire.prenom} ${bail.locataire.nom},</p><p>Nous constatons <strong>${moisImpayes} mois d'impayés</strong> pour ${bail.appartement.numero}.</p><p>Total dû : <strong>${totalDu.toLocaleString()} FCFA</strong></p><p>Délai : <strong>15 jours</strong>.</p><p>IMMOSTAR SCI</p></div>`;
      try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "MISE_EN_DEMEURE", sujet, contenu, destinataire: bail.locataire.email } }); misesDemeure++; } catch {}
    }
  }

  if (moisImpayes >= bail.seuilSuspension) {
    await prisma.bail.update({ where: { id: bail.id }, data: { statut: "SUSPENDU" } });
    if (bail.locataire.email) {
      const sujet = `SUSPENSION DE BAIL — ${bail.appartement.numero}`;
      const contenu = `<p>Votre bail pour ${bail.appartement.numero} a été <strong>suspendu</strong> (${moisImpayes} mois d'impayés).</p>`;
      try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "SUSPENSION_BAIL", sujet, contenu, destinataire: bail.locataire.email } }); } catch {}
    }
    suspensions++;
  }

  return { misesDemeure, suspensions };
}
