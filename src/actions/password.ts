"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { compare, hash } from "bcryptjs";

export async function changerMotDePasse(ancien: string, nouveau: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Non connecté" };

  const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Utilisateur introuvable" };

  const valid = await compare(ancien, user.motDePasse);
  if (!valid) return { error: "Ancien mot de passe incorrect" };

  if (nouveau.length < 6) return { error: "Minimum 6 caractères" };

  const hashed = await hash(nouveau, 12);
  await prisma.utilisateur.update({ where: { id: user.id }, data: { motDePasse: hashed } });
  return { success: true };
}
