"use server";

import { prisma, safeAction } from "@/lib/prisma";
import { locataireSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getLocataires(filters?: { recherche?: string; statut?: string }) {
  const where: any = {};
  if (filters?.statut) where.statut = filters.statut;
  if (filters?.recherche) where.OR = [
    { nom: { contains: filters.recherche, mode: "insensitive" } },
    { prenom: { contains: filters.recherche, mode: "insensitive" } },
  ];

  return prisma.locataire.findMany({
    where,
    include: { baux: { where: { statut: "ACTIF" }, include: { appartement: { select: { numero: true, etage: true, immeubleId: true, immeuble: { select: { id: true, nom: true } } } }, paiements: true } } },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
}

export async function getLocataire(id: string) {
  return prisma.locataire.findUnique({
    where: { id },
    include: { baux: { include: { appartement: { include: { immeuble: true } }, paiements: { orderBy: { moisConcerne: "desc" } }, penalites: { orderBy: { appliqueLe: "desc" } } }, orderBy: { creeLe: "desc" } }, utilisateur: true },
  });
}

export async function creerLocataire(formData: FormData) {
  return safeAction(async () => {
    const data = Object.fromEntries(formData);
    const parsed = locataireSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const appart = await prisma.appartement.findUnique({ where: { id: parsed.data.appartementId } });
    if (!appart || appart.statut === "OCCUPE") return { error: "Cet appartement n'est pas disponible" };

    const locataire = await prisma.locataire.create({
      data: {
        nom: parsed.data.nom, prenom: parsed.data.prenom || parsed.data.nom, telephone: parsed.data.telephone,
        email: parsed.data.email || null, numeroCNI: parsed.data.numeroCNI || null,
        photo: parsed.data.photo || null, dateEntree: parsed.data.dateEntree,
      },
    });

    await prisma.appartement.update({ where: { id: parsed.data.appartementId }, data: { statut: "OCCUPE" } });

    // Create bail if montantLoyer is provided
    const montantLoyer = parseInt(data.montantLoyer as string);
    if (montantLoyer && montantLoyer > 0) {
      const dateDebut = parsed.data.dateEntree;
      const dureeMois = parseInt(data.dureeMois as string) || 12;
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + dureeMois);

      let datePremierLoyer: Date;
      if (dateDebut.getDate() > 15) {
        datePremierLoyer = new Date(dateDebut.getFullYear(), dateDebut.getMonth() + 1, 1);
      } else {
        datePremierLoyer = new Date(dateDebut.getFullYear(), dateDebut.getMonth(), 1);
      }

      let charges: { type: string; montant: number }[] = [];
      try { charges = data.chargesLocatives ? JSON.parse(data.chargesLocatives as string) : []; } catch { charges = []; }
      const totalCharges = charges.reduce((s, c) => s + c.montant, 0);

      await prisma.bail.create({
        data: {
          locataireId: locataire.id, appartementId: parsed.data.appartementId,
          dateDebut, dureeMois, dateFin, datePremierLoyer,
          montantLoyer,
          montantCaution: parseInt(data.montantCaution as string) || 0,
          chargesLocatives: charges, totalCharges, totalMensuel: montantLoyer + totalCharges,
          periodicite: ((data.periodicite as string) || "MENSUEL") as any,
          jourLimitePaiement: parseInt(data.jourLimitePaiement as string) || 5,
          delaiGrace: parseInt(data.delaiGrace as string) || 5,
          penaliteType: (data.penaliteType as string) === "MONTANT_FIXE" ? "MONTANT_FIXE" : "POURCENTAGE",
          penaliteMontant: parseInt(data.penaliteMontant as string) || 5,
          penaliteRecurrente: data.penaliteRecurrente === "on" || data.penaliteRecurrente === "true",
          renouvellementAuto: data.renouvellementAuto === "on" || data.renouvellementAuto === "true",
          dureeRenouvellement: parseInt(data.dureeRenouvellement as string) || null,
          augmentationLoyer: parseInt(data.augmentationLoyer as string) || null,
          preavisNonRenouv: parseInt(data.preavisNonRenouv as string) || 30,
          preavisResiliation: parseInt(data.preavisResiliation as string) || 30,
          seuilMiseEnDemeure: parseInt(data.seuilMiseEnDemeure as string) || 2,
          seuilSuspension: parseInt(data.seuilSuspension as string) || 3,
          clausesParticulieres: (data.clausesParticulieres as string) || null,
        },
      });
    }

    revalidatePath("/locataires");
    return { success: true };
  });
}

export async function modifierLocataire(id: string, formData: FormData) {
  return safeAction(async () => {
    const data = Object.fromEntries(formData);
    const updateData: any = {};
    if (data.nom) updateData.nom = data.nom;
    if (data.prenom) updateData.prenom = data.prenom;
    if (data.telephone) updateData.telephone = data.telephone;
    if (data.email) updateData.email = data.email;
    if (data.numeroCNI) updateData.numeroCNI = data.numeroCNI;
    if (data.photo) updateData.photo = data.photo;

    await prisma.locataire.update({ where: { id }, data: updateData });
    revalidatePath("/locataires");
    return { success: true };
  });
}

export async function creerCompteLocataire(locataireId: string, email: string) {
  return safeAction(async () => {
    const { hash } = await import("bcryptjs");
    const existing = await prisma.utilisateur.findUnique({ where: { email } });
    if (existing) return { error: "Un compte avec cet email existe déjà" };

    const locataire = await prisma.locataire.findUnique({ where: { id: locataireId } });
    if (!locataire) return { error: "Locataire introuvable" };

    const mdp = await hash("locataire123", 12);
    await prisma.$transaction(async (tx) => {
      await tx.utilisateur.create({ data: { email, motDePasse: mdp, role: "LOCATAIRE", locataireId } });
      if (!locataire.email) await tx.locataire.update({ where: { id: locataireId }, data: { email } });
    });

    revalidatePath(`/locataires/${locataireId}`);
    return { success: true, mdpDefaut: "locataire123" };
  });
}

export async function archiverLocataire(id: string) {
  return safeAction(async () => {
    await prisma.$transaction(async (tx) => {
      const bailActif = await tx.bail.findFirst({ where: { locataireId: id, statut: "ACTIF" } });
      if (bailActif) {
        await tx.bail.update({ where: { id: bailActif.id }, data: { statut: "RESILIE" } });
        await tx.appartement.update({ where: { id: bailActif.appartementId }, data: { statut: "LIBRE" } });
      }
      await tx.locataire.update({ where: { id }, data: { statut: "ARCHIVE", dateSortie: new Date() } });
    });
    revalidatePath("/locataires");
    return { success: true };
  });
}
