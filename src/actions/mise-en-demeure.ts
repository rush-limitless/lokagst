"use server";

import { prisma } from "@/lib/prisma";
import { requireGestionnaire } from "@/lib/auth-guard";
import { formatFCFA } from "@/lib/utils";

export async function genererMiseEnDemeureData(locataireId: string) {
  await requireGestionnaire();
  const bail = await prisma.bail.findFirst({
    where: { locataireId, statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: { include: { immeuble: true } }, penalites: { where: { payee: false } } },
  });
  if (!bail) return null;

  const now = new Date();
  const penalitesTotal = bail.penalites.reduce((s, p) => s + p.montant, 0);

  // Calculer mois impayés
  let moisImpayes = 0;
  for (let i = 0; i < 12; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (m < bail.dateDebut) break;
    const paye = await prisma.paiement.findFirst({ where: { bailId: bail.id, moisConcerne: { gte: m, lt: new Date(m.getFullYear(), m.getMonth() + 1, 1) }, statut: "PAYE" } });
    if (!paye) moisImpayes++;
    else break;
  }

  const totalDu = moisImpayes * bail.totalMensuel + penalitesTotal;

  return {
    locataire: `${bail.locataire.prenom} ${bail.locataire.nom}`,
    adresse: bail.appartement.immeuble?.adresse || "Nkolfoulou, Yaoundé",
    appartement: bail.appartement.numero,
    immeuble: bail.appartement.immeuble?.nom || "",
    loyer: formatFCFA(bail.montantLoyer),
    charges: formatFCFA(bail.totalCharges),
    totalMensuel: formatFCFA(bail.totalMensuel),
    moisImpayes,
    penalites: formatFCFA(penalitesTotal),
    totalDu: formatFCFA(totalDu),
    totalDuNum: totalDu,
    dateDebut: bail.dateDebut.toLocaleDateString("fr-FR"),
    date: now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  };
}
