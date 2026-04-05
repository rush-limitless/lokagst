import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, genererEmailRappel } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Sécurité : vérifier le secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const jour = now.getDate();
  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const results = { rappels: 0, impayes: 0, penalites: 0, misesDemeure: 0, suspensions: 0, renouvellements: 0, expirations: 0 };

  const bauxActifs = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: true, appartement: true, paiements: true, penalites: true },
  });

  for (const bail of bauxActifs) {
    if (!bail.locataire.email) continue;

    const paiementMois = bail.paiements.find((p) => p.moisConcerne.getTime() === moisCourant.getTime());
    const estPaye = paiementMois && paiementMois.statut === "PAYE";

    // 1. Rappel d'échéance (3 jours avant jour limite)
    if (jour === bail.jourLimitePaiement - 3 && !paiementMois) {
      const moisLabel = moisCourant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      const { sujet, contenu } = genererEmailRappel(bail.locataire.prenom, bail.locataire.nom, bail.totalMensuel, moisLabel);
      try {
        await sendEmail(bail.locataire.email, sujet, contenu);
        await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "RAPPEL_ECHEANCE", sujet, contenu, destinataire: bail.locataire.email } });
        results.rappels++;
      } catch {}
    }

    // 2. Notification impayé (jour après jour limite)
    if (jour === bail.jourLimitePaiement + 1 && !paiementMois) {
      const sujet = `Notification d'impayé — ${moisCourant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
      const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Votre loyer du mois en cours n'a pas été réglé à la date prévue du ${bail.jourLimitePaiement}. Montant dû : ${bail.totalMensuel.toLocaleString()} FCFA.</p><p>Merci de régulariser.</p>`;
      try {
        await sendEmail(bail.locataire.email, sujet, contenu);
        await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "RAPPEL_PAIEMENT", sujet, contenu, destinataire: bail.locataire.email } });
        results.impayes++;
      } catch {}
    }

    // 3. Pénalité de retard (après délai de grâce)
    if (!estPaye && jour > bail.jourLimitePaiement + bail.delaiGrace) {
      const dejaAppliquee = bail.penalites.some((p) => p.moisConcerne.getTime() === moisCourant.getTime());
      const semainesRetard = Math.floor((jour - bail.jourLimitePaiement - bail.delaiGrace) / 7);

      if (!dejaAppliquee || (bail.penaliteRecurrente && semainesRetard > bail.penalites.filter((p) => p.moisConcerne.getTime() === moisCourant.getTime()).length)) {
        const montantPenalite = bail.penaliteType === "POURCENTAGE"
          ? Math.round(bail.montantLoyer * bail.penaliteMontant / 100)
          : bail.penaliteMontant;

        await prisma.penalite.create({
          data: { bailId: bail.id, moisConcerne: moisCourant, montant: montantPenalite, motif: `Retard de paiement — Semaine ${semainesRetard || 1}` },
        });

        const sujet = `Pénalité de retard — ${montantPenalite.toLocaleString()} FCFA`;
        const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Une pénalité de retard de <strong>${montantPenalite.toLocaleString()} FCFA</strong> a été appliquée à votre compte pour le mois en cours.</p>`;
        try {
          await sendEmail(bail.locataire.email, sujet, contenu);
          await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "NOTIFICATION_PENALITE", sujet, contenu, destinataire: bail.locataire.email } });
        } catch {}
        results.penalites++;
      }
    }

    // 4. Compter mois impayés consécutifs
    let moisImpayes = 0;
    for (let i = 0; i < 6; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const p = bail.paiements.find((pay) => pay.moisConcerne.getTime() === m.getTime());
      if (!p || p.statut !== "PAYE") moisImpayes++;
      else break;
    }

    // 5. Mise en demeure
    if (moisImpayes >= bail.seuilMiseEnDemeure && moisImpayes < bail.seuilSuspension) {
      const dejaEnvoyee = await prisma.emailLog.findFirst({
        where: { locataireId: bail.locataireId, type: "MISE_EN_DEMEURE", envoyeLe: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
      });
      if (!dejaEnvoyee) {
        const totalDu = moisImpayes * bail.totalMensuel + bail.penalites.filter((p) => !p.payee).reduce((s, p) => s + p.montant, 0);
        const sujet = `MISE EN DEMEURE — ${moisImpayes} mois d'impayés`;
        const contenu = `<div style="font-family:Arial;max-width:600px;margin:0 auto;border:2px solid red;padding:20px"><h2 style="color:red">MISE EN DEMEURE</h2><p>Monsieur/Madame ${bail.locataire.prenom} ${bail.locataire.nom},</p><p>Nous constatons que vous avez <strong>${moisImpayes} mois d'impayés</strong> pour l'appartement ${bail.appartement.numero}.</p><p>Montant total dû : <strong>${totalDu.toLocaleString()} FCFA</strong></p><p>Vous disposez de <strong>15 jours</strong> pour régulariser votre situation, faute de quoi votre bail sera suspendu.</p><p>La gestion FINSTAR</p></div>`;
        try {
          await sendEmail(bail.locataire.email, sujet, contenu);
          await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "MISE_EN_DEMEURE", sujet, contenu, destinataire: bail.locataire.email } });
          results.misesDemeure++;
        } catch {}
      }
    }

    // 6. Suspension automatique
    if (moisImpayes >= bail.seuilSuspension) {
      await prisma.bail.update({ where: { id: bail.id }, data: { statut: "SUSPENDU" } });
      const sujet = `SUSPENSION DE BAIL — Appartement ${bail.appartement.numero}`;
      const contenu = `<p>Votre bail pour l'appartement ${bail.appartement.numero} a été <strong>suspendu</strong> en raison de ${moisImpayes} mois d'impayés consécutifs.</p>`;
      try {
        await sendEmail(bail.locataire.email, sujet, contenu);
        await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "SUSPENSION_BAIL", sujet, contenu, destinataire: bail.locataire.email } });
      } catch {}
      results.suspensions++;
    }

    // 7. Rappels expiration bail (60j, 30j, 15j)
    const joursRestants = Math.ceil((bail.dateFin.getTime() - now.getTime()) / 86400000);
    if ([60, 30, 15].includes(joursRestants)) {
      const renouvMsg = bail.renouvellementAuto ? "Il sera renouvelé automatiquement si vous êtes à jour." : "Merci de contacter la gestion pour discuter du renouvellement.";
      const sujet = `Votre bail expire dans ${joursRestants} jours`;
      const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Votre bail pour l'appartement ${bail.appartement.numero} expire le ${bail.dateFin.toLocaleDateString("fr-FR")}.</p><p>${renouvMsg}</p>`;
      try {
        await sendEmail(bail.locataire.email, sujet, contenu);
        await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "EXPIRATION_BAIL", sujet, contenu, destinataire: bail.locataire.email } });
        results.expirations++;
      } catch {}
    }

    // 8. Renouvellement automatique
    if (bail.dateFin <= now) {
      if (bail.renouvellementAuto && moisImpayes === 0) {
        const duree = bail.dureeRenouvellement || bail.dureeMois;
        const augmentation = bail.augmentationLoyer || 0;
        const nouveauLoyer = Math.round(bail.montantLoyer * (1 + augmentation / 100));
        const dateFin = new Date(bail.dateFin);
        dateFin.setMonth(dateFin.getMonth() + duree);

        await prisma.bail.update({ where: { id: bail.id }, data: { statut: "TERMINE" } });
        await prisma.bail.create({
          data: {
            locataireId: bail.locataireId, appartementId: bail.appartementId,
            dateDebut: bail.dateFin, dureeMois: duree, dateFin, montantLoyer: nouveauLoyer,
            montantCaution: bail.montantCaution, chargesLocatives: bail.chargesLocatives as any,
            totalCharges: bail.totalCharges, totalMensuel: nouveauLoyer + bail.totalCharges,
            jourLimitePaiement: bail.jourLimitePaiement, delaiGrace: bail.delaiGrace,
            penaliteType: bail.penaliteType, penaliteMontant: bail.penaliteMontant,
            penaliteRecurrente: bail.penaliteRecurrente, renouvellementAuto: bail.renouvellementAuto,
            dureeRenouvellement: bail.dureeRenouvellement, augmentationLoyer: bail.augmentationLoyer,
            preavisNonRenouv: bail.preavisNonRenouv, preavisResiliation: bail.preavisResiliation,
            seuilMiseEnDemeure: bail.seuilMiseEnDemeure, seuilSuspension: bail.seuilSuspension,
            clausesParticulieres: bail.clausesParticulieres,
          },
        });

        const sujet = `Bail renouvelé — ${duree} mois`;
        const contenu = `<p>Bonjour ${bail.locataire.prenom},</p><p>Votre bail a été renouvelé automatiquement pour ${duree} mois. Nouveau loyer : ${nouveauLoyer.toLocaleString()} FCFA/mois.</p>`;
        try {
          await sendEmail(bail.locataire.email, sujet, contenu);
          await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "RENOUVELLEMENT_BAIL", sujet, contenu, destinataire: bail.locataire.email } });
        } catch {}
        results.renouvellements++;
      } else {
        await prisma.bail.update({ where: { id: bail.id }, data: { statut: "EXPIRE" } });
        await prisma.appartement.update({ where: { id: bail.appartementId }, data: { statut: "LIBRE" } });
        const sujet = "Bail non renouvelé";
        const contenu = `<p>Votre bail pour l'appartement ${bail.appartement.numero} n'a pas été renouvelé en raison d'impayés.</p>`;
        try {
          await sendEmail(bail.locataire.email, sujet, contenu);
          await prisma.emailLog.create({ data: { locataireId: bail.locataireId, type: "NON_RENOUVELLEMENT", sujet, contenu, destinataire: bail.locataire.email } });
        } catch {}
      }
    }
  }

  return NextResponse.json({ ok: true, date: now.toISOString(), ...results });
}
