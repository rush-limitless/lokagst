"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getImmeubles() {
  return prisma.immeuble.findMany({
    include: { _count: { select: { appartements: true } } },
    orderBy: { nom: "asc" },
  });
}

export async function creerImmeuble(formData: FormData) {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const ville = formData.get("ville") as string;
  const quartier = formData.get("quartier") as string;

  if (!nom || !adresse || !ville) return { error: "Nom, adresse et ville requis" };

  await prisma.immeuble.create({ data: { nom, adresse, ville, quartier: quartier || null } });
  revalidatePath("/immeubles");
  return { success: true };
}

export async function modifierImmeuble(id: string, formData: FormData) {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const ville = formData.get("ville") as string;
  const quartier = formData.get("quartier") as string;
  if (!nom || !adresse || !ville) return { error: "Nom, adresse et ville requis" };
  await prisma.immeuble.update({ where: { id }, data: { nom, adresse, ville, quartier: quartier || null } });
  revalidatePath("/immeubles");
  return { success: true };
}

export async function getAuditLogs(limit: number = 50) {
  return prisma.auditLog.findMany({ orderBy: { creeLe: "desc" }, take: limit });
}
