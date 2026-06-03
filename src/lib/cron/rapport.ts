import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";
import { envoyerFacturesMensuelles } from "@/actions/factures";

export async function envoyerRapportMensuel(now: Date) {
  const facturesResult = await envoyerFacturesMensuelles();
  const admin = await prisma.utilisateur.findFirst({ where: { role: "GESTIONNAIRE" } });
  if (!admin) return facturesResult.envoyes;

  const moisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const label = moisPrec.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const bauxA = await prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { paiements: true } });
  const totalRegle = bauxA.reduce((s, b) => s + b.paiements.filter(p => new Date(p.moisConcerne).getMonth() === moisPrec.getMonth() && new Date(p.moisConcerne).getFullYear() === moisPrec.getFullYear()).reduce((a, p) => a + p.montant, 0), 0);
  const totalAttendu = bauxA.filter(b => isMoisEcheance(moisPrec, b.dateDebut, b.periodicite)).reduce((s, b) => s + b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1), 0);
  const taux = totalAttendu > 0 ? Math.round(totalRegle / totalAttendu * 100) : 0;
  const couleur = taux >= 80 ? "#2e7d32" : "#c62828";
  const sujet = `Rapport mensuel IMMOSTAR SCI — ${label}`;
  const contenu = `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#1B6B9E;color:white;padding:20px;text-align:center"><h1 style="margin:0">IMMOSTAR SCI</h1><p style="margin:5px 0 0;opacity:0.8">Rapport mensuel — ${label}</p></div><div style="padding:20px;border:1px solid #eee"><table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Revenus encaissés</td><td style="padding:8px;font-weight:bold;color:#2e7d32">${totalRegle.toLocaleString("fr-FR")} FCFA</td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Revenus attendus</td><td style="padding:8px;font-weight:bold">${totalAttendu.toLocaleString("fr-FR")} FCFA</td></tr><tr><td style="padding:8px;color:#666">Taux de recouvrement</td><td style="padding:8px;font-weight:bold;color:${couleur}">${taux}%</td></tr></table><p style="margin-top:15px;color:#666;font-size:12px">Connectez-vous à ImmoGest pour le rapport détaillé.</p></div></div>`;
  try { await sendEmail(admin.email, sujet, contenu); } catch {}
  return facturesResult.envoyes;
}
