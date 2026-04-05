"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function signerMonBail(signatureDataUrl: string) {
  const session = await auth();
  if (!session?.user?.locataireId) return { error: "Non autorisé" };

  const bail = await prisma.bail.findFirst({
    where: { locataireId: session.user.locataireId, statut: "ACTIF" },
  });
  if (!bail) return { error: "Aucun bail actif" };
  if (bail.signatureLocataire) return { error: "Bail déjà signé" };

  await prisma.bail.update({
    where: { id: bail.id },
    data: { signatureLocataire: signatureDataUrl, dateSignature: new Date() },
  });
  revalidatePath("/mon-espace/bail");
  return { success: true };
}
