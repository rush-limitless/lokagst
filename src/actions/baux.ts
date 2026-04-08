"use server";

import { prisma } from "@/lib/prisma";
import { bailSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getBaux(filters?: { statut?: string; expirantDans?: number }) {
  const where: any = {};
  if (filters?.statut) where.statut = filters.statut;
  if (filters?.expirantDans) {
    const limit = new Date();
    limit.setDate(limit.getDate() + filters.expirantDans);
    where.dateFin = { lte: limit };
    where.statut = "ACTIF";
  }

  return prisma.bail.findMany({
    where,
    include: { locataire: { select: { nom: true, prenom: true, photo: true } }, appartement: { select: { numero: true, etage: true } } },
    orderBy: [{ locataire: { nom: "asc" } }],
  });
}

export async function getBail(id: string) {
  return prisma.bail.findUnique({
    where: { id },
    include: { locataire: true, appartement: true, paiements: { orderBy: { moisConcerne: "desc" } }, penalites: { orderBy: { appliqueLe: "desc" } } },
  });
}

export async function creerBail(formData: FormData) {
  const raw = Object.fromEntries(formData);
  // Handle checkboxes (absent = false)
  raw.renouvellementAuto = raw.renouvellementAuto === "on" ? "true" : "false";
  raw.penaliteRecurrente = raw.penaliteRecurrente === "on" ? "true" : "false";

  const parsed = bailSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const dateFin = new Date(parsed.data.dateDebut);
  dateFin.setMonth(dateFin.getMonth() + parsed.data.dureeMois);

  // Règle du 15 : si signature après le 15, premier loyer = mois suivant
  const dateDebut = new Date(parsed.data.dateDebut);
  let datePremierLoyer: Date;
  if (dateDebut.getDate() > 15) {
    datePremierLoyer = new Date(dateDebut.getFullYear(), dateDebut.getMonth() + 1, 1);
  } else {
    datePremierLoyer = new Date(dateDebut.getFullYear(), dateDebut.getMonth(), 1);
  }

  // Parse charges
  let charges: { type: string; montant: number }[] = [];
  try {
    charges = parsed.data.chargesLocatives ? JSON.parse(parsed.data.chargesLocatives) : [];
  } catch { charges = []; }
  const totalCharges = charges.reduce((s, c) => s + c.montant, 0);
  const totalMensuel = parsed.data.montantLoyer + totalCharges;

  await prisma.bail.create({
    data: {
      locataireId: parsed.data.locataireId,
      appartementId: parsed.data.appartementId,
      dateDebut: parsed.data.dateDebut,
      dureeMois: parsed.data.dureeMois,
      dateFin,
      montantLoyer: parsed.data.montantLoyer,
      montantCaution: parsed.data.montantCaution,
      datePremierLoyer: datePremierLoyer,
      periodicite: parsed.data.periodicite as any,
      chargesLocatives: charges,
      totalCharges,
      totalMensuel,
      jourLimitePaiement: parsed.data.jourLimitePaiement,
      delaiGrace: parsed.data.delaiGrace,
      penaliteType: parsed.data.penaliteType,
      penaliteMontant: parsed.data.penaliteMontant,
      penaliteRecurrente: parsed.data.penaliteRecurrente,
      renouvellementAuto: parsed.data.renouvellementAuto,
      dureeRenouvellement: parsed.data.dureeRenouvellement || null,
      augmentationLoyer: parsed.data.augmentationLoyer || null,
      preavisNonRenouv: parsed.data.preavisNonRenouv,
      preavisResiliation: parsed.data.preavisResiliation,
      seuilMiseEnDemeure: parsed.data.seuilMiseEnDemeure,
      seuilSuspension: parsed.data.seuilSuspension,
      clausesParticulieres: parsed.data.clausesParticulieres || null,
    },
  });
  await prisma.appartement.update({ where: { id: parsed.data.appartementId }, data: { statut: "OCCUPE" } });
  revalidatePath("/baux");
  return { success: true };
}

export async function signerBail(id: string, signatureDataUrl: string) {
  await prisma.bail.update({
    where: { id },
    data: { signatureLocataire: signatureDataUrl, dateSignature: new Date() },
  });
  revalidatePath(`/baux/${id}`);
  return { success: true };
}

export async function uploaderContrat(id: string, contratUrl: string) {
  await prisma.bail.update({
    where: { id },
    data: { contratUpload: contratUrl },
  });
  revalidatePath(`/baux/${id}`);
  return { success: true };
}

export async function resilierBail(id: string) {
  const bail = await prisma.bail.findUnique({ where: { id } });
  if (!bail) return { error: "Bail introuvable" };

  await prisma.bail.update({ where: { id }, data: { statut: "RESILIE" } });
  await prisma.appartement.update({ where: { id: bail.appartementId }, data: { statut: "LIBRE" } });

  const autreBail = await prisma.bail.findFirst({ where: { locataireId: bail.locataireId, statut: "ACTIF" } });
  if (!autreBail) await prisma.locataire.update({ where: { id: bail.locataireId }, data: { statut: "ARCHIVE", dateSortie: new Date() } });

  revalidatePath("/baux");
  return { success: true };
}

export async function leverSuspension(id: string) {
  await prisma.bail.update({ where: { id }, data: { statut: "ACTIF" } });
  revalidatePath("/baux");
  return { success: true };
}

export async function modifierBail(id: string, formData: FormData) {
  const bail = await prisma.bail.findUnique({ where: { id } });
  if (!bail) return { error: "Bail introuvable" };

  const dateDebut = formData.get("dateDebut") ? new Date(formData.get("dateDebut") as string) : bail.dateDebut;
  const dateFin = formData.get("dateFin") ? new Date(formData.get("dateFin") as string) : bail.dateFin;
  const montantLoyer = formData.get("montantLoyer") ? parseInt(formData.get("montantLoyer") as string) : bail.montantLoyer;
  const montantCaution = formData.get("montantCaution") ? parseInt(formData.get("montantCaution") as string) : bail.montantCaution;
  const renouvellementAuto = formData.get("renouvellementAuto") === "on" || formData.get("renouvellementAuto") === "true";

  let charges = bail.chargesLocatives as { type: string; montant: number }[];
  try {
    const raw = formData.get("chargesLocatives") as string;
    if (raw) charges = JSON.parse(raw);
  } catch {}
  const totalCharges = charges.reduce((s, c) => s + c.montant, 0);

  await prisma.bail.update({
    where: { id },
    data: {
      dateDebut, dateFin, montantLoyer, montantCaution, renouvellementAuto,
      chargesLocatives: charges, totalCharges, totalMensuel: montantLoyer + totalCharges,
    },
  });

  revalidatePath(`/baux/${id}`);
  return { success: true };
}

export async function renouvelerBail(id: string, formData: FormData) {
  const bail = await prisma.bail.findUnique({ where: { id } });
  if (!bail) return { error: "Bail introuvable" };

  const dureeMois = parseInt(formData.get("dureeMois") as string) || bail.dureeMois;
  const montantLoyer = parseInt(formData.get("montantLoyer") as string) || bail.montantLoyer;

  const dateDebut = bail.dateFin;
  const dateFin = new Date(dateDebut);
  dateFin.setMonth(dateFin.getMonth() + dureeMois);

  await prisma.bail.update({ where: { id }, data: { statut: "TERMINE" } });
  await prisma.bail.create({
    data: {
      locataireId: bail.locataireId,
      appartementId: bail.appartementId,
      dateDebut,
      dureeMois,
      dateFin,
      montantLoyer,
      montantCaution: bail.montantCaution,
      chargesLocatives: bail.chargesLocatives as any,
      totalCharges: bail.totalCharges,
      totalMensuel: montantLoyer + bail.totalCharges,
      jourLimitePaiement: bail.jourLimitePaiement,
      delaiGrace: bail.delaiGrace,
      penaliteType: bail.penaliteType,
      penaliteMontant: bail.penaliteMontant,
      penaliteRecurrente: bail.penaliteRecurrente,
      renouvellementAuto: bail.renouvellementAuto,
      dureeRenouvellement: bail.dureeRenouvellement,
      augmentationLoyer: bail.augmentationLoyer,
      preavisNonRenouv: bail.preavisNonRenouv,
      preavisResiliation: bail.preavisResiliation,
      seuilMiseEnDemeure: bail.seuilMiseEnDemeure,
      seuilSuspension: bail.seuilSuspension,
      clausesParticulieres: bail.clausesParticulieres,
    },
  });

  revalidatePath("/baux");
  return { success: true };
}
