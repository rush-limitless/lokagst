"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const locataires = await prisma.locataire.findMany({
    where: { statut: "ACTIF" },
    include: {
      messages: { orderBy: { creeLe: "desc" }, take: 1 },
      _count: { select: { messages: { where: { lu: false, expediteur: "LOCATAIRE" } } } },
    },
    orderBy: { nom: "asc" },
  });
  return locataires.map((l) => ({
    id: l.id, nom: l.nom, prenom: l.prenom, photo: l.photo,
    dernierMessage: l.messages[0]?.contenu || null,
    dernierDate: l.messages[0]?.creeLe || null,
    nonLus: l._count.messages,
  }));
}

export async function getMessages(locataireId: string) {
  // Marquer comme lus
  const session = await auth();
  const role = session?.user?.role;
  if (role === "GESTIONNAIRE") {
    await prisma.message.updateMany({ where: { locataireId, expediteur: "LOCATAIRE", lu: false }, data: { lu: true } });
  } else {
    await prisma.message.updateMany({ where: { locataireId, expediteur: "GESTIONNAIRE", lu: false }, data: { lu: true } });
  }

  return prisma.message.findMany({ where: { locataireId }, orderBy: { creeLe: "asc" } });
}

export async function envoyerMessage(locataireId: string, contenu: string) {
  const session = await auth();
  const expediteur = session?.user?.role === "GESTIONNAIRE" ? "GESTIONNAIRE" : "LOCATAIRE";

  await prisma.message.create({ data: { locataireId, contenu, expediteur: expediteur as any } });
  revalidatePath("/messagerie");
  return { success: true };
}

export async function getMesMessages() {
  const session = await auth();
  if (!session?.user?.locataireId) return [];
  return prisma.message.findMany({ where: { locataireId: session.user.locataireId }, orderBy: { creeLe: "asc" } });
}
