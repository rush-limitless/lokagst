import { prisma } from "@/lib/prisma";
import { sendEmail, genererEmailRappel } from "@/lib/email";
import { envoyerRappelWhatsApp } from "@/lib/whatsapp";
import type { BailComplet } from "./types";

export async function traiterRappels(bail: BailComplet, jour: number, moisCourant: Date, attendu: number, estPaye: boolean) {
  let rappels = 0, impayes = 0;
  if (!bail.locataire.email) return { rappels, impayes };

  if (jour === bail.jourLimitePaiement - 3 && !estPaye) {
    const moisLabel = moisCourant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const { sujet, contenu } = genererEmailRappel(bail.locataire.prenom, bail.locataire.nom, attendu, moisLabel);
    try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "RAPPEL_ECHEANCE", sujet, contenu, destinataire: bail.locataire.email } }); rappels++; } catch {}
    if (bail.locataire.telephone) { try { await envoyerRappelWhatsApp(bail.locataire.telephone, bail.locataire.prenom, attendu, moisLabel); } catch {} }
  }

  if (jour === bail.jourLimitePaiement + 1 && !estPaye) {
    const sujet = `Notification d'impayé — ${moisCourant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
    const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Votre loyer du mois en cours n'a pas été réglé à la date prévue du ${bail.jourLimitePaiement}. Montant dû : ${attendu.toLocaleString()} FCFA.</p><p>Merci de régulariser.</p>`;
    try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "RAPPEL_PAIEMENT", sujet, contenu, destinataire: bail.locataire.email } }); impayes++; } catch {}
  }

  return { rappels, impayes };
}
