"use server";

import { prisma } from "@/lib/prisma";

export async function rechercheGlobale(query: string) {
  if (!query || query.length < 2) return { locataires: [], appartements: [], baux: [] };

  const [locataires, appartements, baux] = await Promise.all([
    prisma.locataire.findMany({
      where: { OR: [{ nom: { contains: query, mode: "insensitive" } }, { prenom: { contains: query, mode: "insensitive" } }, { telephone: { contains: query } }] },
      select: { id: true, nom: true, prenom: true, telephone: true, statut: true, photo: true },
      take: 5,
    }),
    prisma.appartement.findMany({
      where: { numero: { contains: query, mode: "insensitive" } },
      select: { id: true, numero: true, etage: true, statut: true, loyerBase: true },
      take: 5,
    }),
    prisma.bail.findMany({
      where: { OR: [{ locataire: { nom: { contains: query, mode: "insensitive" } } }, { appartement: { numero: { contains: query, mode: "insensitive" } } }] },
      select: { id: true, statut: true, locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } },
      take: 5,
    }),
  ]);

  return { locataires, appartements, baux };
}
