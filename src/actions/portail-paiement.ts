"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function soumettrePreuvePaiement(formData: FormData) {
  const session = await auth();
  if (!session?.user?.locataireId) return { error: "Non autorisé" };

  const montantRaw = parseInt(formData.get("montant") as string);
  const moisConcerne = new Date(formData.get("moisConcerne") as string);
  const modePaiement = formData.get("modePaiement") as string;
  const preuvePaiement = formData.get("preuvePaiement") as string;
  const notes = formData.get("notes") as string;

  // Validation serveur
  if (!montantRaw || montantRaw <= 0) return { error: "Montant invalide" };
  if (!preuvePaiement) return { error: "Preuve de paiement requise" };
  if (!modePaiement || !["VIREMENT_BANCAIRE", "MOBILE_MONEY", "ESPECES"].includes(modePaiement)) return { error: "Mode de paiement invalide" };
  if (isNaN(moisConcerne.getTime())) return { error: "Mois concerné invalide" };

  const bail = await prisma.bail.findFirst({
    where: { locataireId: session.user.locataireId, statut: "ACTIF" },
  });
  if (!bail) return { error: "Aucun bail actif" };

  // Transaction pour éviter les race conditions (doublons)
  await prisma.$transaction(async (tx) => {
    const existing = await tx.paiement.findFirst({
      where: { bailId: bail.id, moisConcerne },
    });
    const dejaRegle = existing?.montant || 0;
    if (montantRaw + dejaRegle > bail.totalMensuel * 2) throw new Error("Montant trop élevé");

    const montantTotal = dejaRegle + montantRaw;
    const resteDu = Math.max(0, bail.totalMensuel - montantTotal);
    const statut = resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE";

    if (existing) {
      await tx.paiement.update({ where: { id: existing.id }, data: { montant: montantTotal, resteDu, statut, preuvePaiement, modePaiement: modePaiement as any, notes } });
    } else {
      await tx.paiement.create({ data: { bailId: bail.id, montant: montantRaw, moisConcerne, modePaiement: modePaiement as any, resteDu, statut, preuvePaiement, notes, valide: false } });
    }
  });

  revalidatePath("/mon-espace/paiements");
  return { success: true };
}
