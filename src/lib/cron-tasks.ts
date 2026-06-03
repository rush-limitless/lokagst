import { prisma } from "@/lib/prisma";
import { sendEmail, genererEmailRappel } from "@/lib/email";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";
import { envoyerFacturesMensuelles } from "@/actions/factures";
import { envoyerRappelWhatsApp } from "@/lib/whatsapp";

type BailComplet = Awaited<ReturnType<typeof getBauxActifs>>[number];

export async function getBauxActifs() {
  return prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: true, appartement: true, paiements: true, penalites: true },
  });
}

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

export function getInfosPeriode(bail: BailComplet, moisCourant: Date) {
  const freq = PERIODICITE_MOIS[bail.periodicite] || 1;
  const periodeDebut = new Date(moisCourant);
  const periodeFin = new Date(moisCourant.getFullYear(), moisCourant.getMonth() + freq, 1);
  const totalPayePeriode = bail.paiements
    .filter((p) => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; })
    .reduce((s, p) => s + p.montant, 0);
  const attenduPeriode = bail.totalMensuel * freq;
  return { freq, periodeDebut, periodeFin, totalPayePeriode, attenduPeriode, estPaye: totalPayePeriode >= attenduPeriode };
}

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

export async function traiterRenouvellements(bail: BailComplet, now: Date) {
  let renouvellements = 0, expirations = 0;
  if (!bail.locataire.email) return { renouvellements, expirations };

  // Rappels expiration (60j, 30j, 15j)
  const joursRestants = Math.ceil((bail.dateFin.getTime() - now.getTime()) / 86400000);
  if ([60, 30, 15].includes(joursRestants)) {
    const renouvMsg = bail.renouvellementAuto ? "Il sera renouvelé automatiquement." : "Contactez la gestion pour le renouvellement.";
    const sujet = `Bail expire dans ${joursRestants} jours`;
    const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Votre bail pour ${bail.appartement.numero} expire le ${bail.dateFin.toLocaleDateString("fr-FR")}.</p><p>${renouvMsg}</p>`;
    try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "EXPIRATION_BAIL", sujet, contenu, destinataire: bail.locataire.email } }); expirations++; } catch {}
  }

  // Renouvellement auto
  if (bail.dateFin <= now) {
    if (bail.renouvellementAuto) {
      const duree = bail.dureeRenouvellement || bail.dureeMois;
      const augmentation = bail.augmentationLoyer || 0;
      const nouveauLoyer = Math.round(bail.montantLoyer * (1 + augmentation / 100));
      const dateFin = new Date(bail.dateFin);
      dateFin.setMonth(dateFin.getMonth() + duree);

      await prisma.$transaction(async (tx) => {
        await tx.bail.update({ where: { id: bail.id }, data: { statut: "TERMINE" } });
        await tx.bail.create({
          data: {
            locataireId: bail.locataireId, appartementId: bail.appartementId,
            dateDebut: bail.dateFin, dureeMois: duree, dateFin, montantLoyer: nouveauLoyer,
            montantCaution: bail.montantCaution, chargesLocatives: bail.chargesLocatives as any,
            totalCharges: bail.totalCharges, totalMensuel: nouveauLoyer + bail.totalCharges,
            impotsTaxes: bail.impotsTaxes as any, totalImpotsTaxes: bail.totalImpotsTaxes,
            jourLimitePaiement: bail.jourLimitePaiement, delaiGrace: bail.delaiGrace,
            penaliteType: bail.penaliteType, penaliteMontant: bail.penaliteMontant,
            penaliteRecurrente: bail.penaliteRecurrente, renouvellementAuto: bail.renouvellementAuto,
            dureeRenouvellement: bail.dureeRenouvellement, augmentationLoyer: bail.augmentationLoyer,
            preavisNonRenouv: bail.preavisNonRenouv, preavisResiliation: bail.preavisResiliation,
            seuilMiseEnDemeure: bail.seuilMiseEnDemeure, seuilSuspension: bail.seuilSuspension,
            clausesParticulieres: bail.clausesParticulieres, periodicite: bail.periodicite, cautionPayee: bail.cautionPayee,
          },
        });
      });
      const sujet = `Bail renouvelé — ${duree} mois`;
      const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Bail renouvelé pour ${duree} mois. Nouveau loyer : ${nouveauLoyer.toLocaleString()} FCFA/mois.</p>`;
      try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "RENOUVELLEMENT_BAIL", sujet, contenu, destinataire: bail.locataire.email } }); } catch {}
      renouvellements++;
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.bail.update({ where: { id: bail.id }, data: { statut: "EXPIRE" } });
        await tx.appartement.update({ where: { id: bail.appartementId }, data: { statut: "LIBRE" } });
      });
    }
  }

  return { renouvellements, expirations };
}
