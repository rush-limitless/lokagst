"use server";

import { prisma } from "@/lib/prisma";
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
    include: { baux: { where: { statut: "ACTIF" }, include: { appartement: { select: { numero: true, etage: true } }, paiements: true } } },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
}

export async function getLocataire(id: string) {
  return prisma.locataire.findUnique({
    where: { id },
    include: { baux: { include: { appartement: true, paiements: { orderBy: { moisConcerne: "desc" } }, penalites: { orderBy: { appliqueLe: "desc" } } }, orderBy: { creeLe: "desc" } }, utilisateur: true },
  });
}

export async function creerLocataire(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = locataireSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const appart = await prisma.appartement.findUnique({ where: { id: parsed.data.appartementId } });
  if (!appart || appart.statut === "OCCUPE") return { error: "Cet appartement n'est pas disponible" };

  await prisma.locataire.create({
    data: {
      nom: parsed.data.nom,
      prenom: parsed.data.prenom,
      telephone: parsed.data.telephone,
      email: parsed.data.email || null,
      numeroCNI: parsed.data.numeroCNI || null,
      photo: parsed.data.photo || null,
      dateEntree: parsed.data.dateEntree,
    },
  });
  await prisma.appartement.update({ where: { id: parsed.data.appartementId }, data: { statut: "OCCUPE" } });
  revalidatePath("/locataires");
  return { success: true };
}

export async function modifierLocataire(id: string, formData: FormData) {
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
}

export async function creerCompteLocataire(locataireId: string, email: string) {
  const { hash } = await import("bcryptjs");
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) return { error: "Un compte avec cet email existe déjà" };

  const locataire = await prisma.locataire.findUnique({ where: { id: locataireId } });
  if (!locataire) return { error: "Locataire introuvable" };

  const mdp = await hash("locataire123", 12);
  await prisma.utilisateur.create({ data: { email, motDePasse: mdp, role: "LOCATAIRE", locataireId } });
  if (!locataire.email) await prisma.locataire.update({ where: { id: locataireId }, data: { email } });

  revalidatePath(`/locataires/${locataireId}`);
  return { success: true, mdpDefaut: "locataire123" };
}

export async function archiverLocataire(id: string) {
  const bailActif = await prisma.bail.findFirst({ where: { locataireId: id, statut: "ACTIF" } });
  if (bailActif) {
    await prisma.bail.update({ where: { id: bailActif.id }, data: { statut: "RESILIE" } });
    await prisma.appartement.update({ where: { id: bailActif.appartementId }, data: { statut: "LIBRE" } });
  }
  await prisma.locataire.update({ where: { id }, data: { statut: "ARCHIVE", dateSortie: new Date() } });
  revalidatePath("/locataires");
  return { success: true };
}
