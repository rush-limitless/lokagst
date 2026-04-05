"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function soumettrePreuvePaiement(formData: FormData) {
  const session = await auth();
  if (!session?.user?.locataireId) return { error: "Non autorisé" };

  const montant = parseInt(formData.get("montant") as string);
  const moisConcerne = new Date(formData.get("moisConcerne") as string);
  const modePaiement = formData.get("modePaiement") as string;
  const preuvePaiement = formData.get("preuvePaiement") as string;
  const notes = formData.get("notes") as string;

  if (!montant || !preuvePaiement) return { error: "Montant et preuve requis" };

  const bail = await prisma.bail.findFirst({
    where: { locataireId: session.user.locataireId, statut: "ACTIF" },
  });
  if (!bail) return { error: "Aucun bail actif" };

  const existing = await prisma.paiement.findUnique({
    where: { bailId_moisConcerne: { bailId: bail.id, moisConcerne } },
  });

  const montantTotal = (existing?.montant || 0) + montant;
  const resteDu = Math.max(0, bail.totalMensuel - montantTotal);
  const statut = resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE";

  if (existing) {
    await prisma.paiement.update({ where: { id: existing.id }, data: { montant: montantTotal, resteDu, statut, preuvePaiement, modePaiement: modePaiement as any, notes } });
  } else {
    await prisma.paiement.create({ data: { bailId: bail.id, montant, moisConcerne, modePaiement: modePaiement as any, resteDu, statut, preuvePaiement, notes } });
  }

  revalidatePath("/mon-espace/paiements");
  return { success: true };
}
