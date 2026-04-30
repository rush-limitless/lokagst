"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail, genererEmailRappel, genererEmailRecu } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function envoyerRappelPaiement(locataireId: string, bailId: string) {
  const bail = await prisma.bail.findUnique({
    where: { id: bailId },
    include: { locataire: true, appartement: true },
  });
  if (!bail || !bail.locataire.email) return { error: "Locataire ou email introuvable" };

  const mois = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const { sujet, contenu } = genererEmailRappel(bail.locataire.prenom, bail.locataire.nom, bail.montantLoyer, mois);

  try {
    await sendEmail(bail.locataire.email, sujet, contenu);
    await prisma.emailLog.create({
      data: { locataireId, type: "RAPPEL_PAIEMENT", sujet, contenu, destinataire: bail.locataire.email },
    });
    revalidatePath("/emails");
    return { success: true };
  } catch {
    return { error: "Échec de l'envoi de l'email" };
  }
}

export async function envoyerRecuPaiement(paiementId: string) {
  const paiement = await prisma.paiement.findUnique({
    where: { id: paiementId },
    include: { bail: { include: { locataire: true, appartement: true } } },
  });
  if (!paiement || !paiement.bail.locataire.email) return { error: "Données introuvables" };

  const loc = paiement.bail.locataire;
  const mois = paiement.moisConcerne.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const mode = { VIREMENT_BANCAIRE: "Virement bancaire", MOBILE_MONEY: "Mobile Money", ESPECES: "Espèces" }[paiement.modePaiement];
  const date = paiement.datePaiement.toLocaleDateString("fr-FR");

  const { sujet, contenu } = genererEmailRecu(loc.prenom, loc.nom, paiement.montant, mois, mode, date, paiement.bail.appartement.numero);

  try {
    await sendEmail(loc.email!, sujet, contenu);
    await prisma.emailLog.create({
      data: { locataireId: loc.id, type: "RECU_PAIEMENT", sujet, contenu, destinataire: loc.email! },
    });
    revalidatePath("/emails");
    return { success: true };
  } catch {
    return { error: "Échec de l'envoi" };
  }
}

export async function envoyerRappelsMassifs() {
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: true, appartement: true, paiements: true },
  });

  const moisCourant = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let envoyes = 0;

  for (const bail of bauxActifs) {
    if (!bail.locataire.email) continue;
    const dejaPaye = bail.paiements.some((p) => p.moisConcerne.getTime() === moisCourant.getTime());
    if (dejaPaye) continue;

    const mois = moisCourant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const { sujet, contenu } = genererEmailRappel(bail.locataire.prenom, bail.locataire.nom, bail.montantLoyer, mois);

    try {
      await sendEmail(bail.locataire.email, sujet, contenu);
      await prisma.emailLog.create({
        data: { locataireId: bail.locataireId, type: "RAPPEL_PAIEMENT", sujet, contenu, destinataire: bail.locataire.email },
      });
      envoyes++;
    } catch { /* skip */ }
  }

  revalidatePath("/emails");
  return { success: true, envoyes };
}

export async function getEmailLogs(locataireId?: string) {
  return prisma.emailLog.findMany({
    where: locataireId ? { locataireId } : {},
    include: { locataire: { select: { nom: true, prenom: true } } },
    orderBy: { envoyeLe: "desc" },
  });
}
