import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import type { BailComplet } from "./types";

export async function traiterRenouvellements(bail: BailComplet, now: Date) {
  let renouvellements = 0, expirations = 0;
  if (!bail.locataire.email) return { renouvellements, expirations };

  const joursRestants = Math.ceil((bail.dateFin.getTime() - now.getTime()) / 86400000);
  if ([60, 30, 15].includes(joursRestants)) {
    const renouvMsg = bail.renouvellementAuto ? "Il sera renouvelé automatiquement." : "Contactez la gestion pour le renouvellement.";
    const sujet = `Bail expire dans ${joursRestants} jours`;
    const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Votre bail pour ${bail.appartement.numero} expire le ${bail.dateFin.toLocaleDateString("fr-FR")}.</p><p>${renouvMsg}</p>`;
    try { await sendEmail(bail.locataire.email, sujet, contenu); await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "EXPIRATION_BAIL", sujet, contenu, destinataire: bail.locataire.email } }); expirations++; } catch {}
  }

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
