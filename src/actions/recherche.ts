"use server";

import { prisma } from "@/lib/prisma";

export async function rechercheGlobale(query: string) {
  if (!query || query.length < 2) return { locataires: [], appartements: [], baux: [], paiements: [] };

  const [locataires, appartements, baux, paiements] = await Promise.all([
    prisma.locataire.findMany({
      where: { OR: [{ nom: { contains: query, mode: "insensitive" } }, { prenom: { contains: query, mode: "insensitive" } }, { telephone: { contains: query } }] },
      select: { id: true, nom: true, prenom: true, telephone: true, statut: true, photo: true },
      take: 5,
      orderBy: [{ nom: "asc" }],
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
    prisma.paiement.findMany({
      where: { bail: { OR: [{ locataire: { nom: { contains: query, mode: "insensitive" } } }, { locataire: { prenom: { contains: query, mode: "insensitive" } } }, { appartement: { numero: { contains: query, mode: "insensitive" } } }] } },
      select: { id: true, montant: true, moisConcerne: true, statut: true, bail: { select: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } } },
      take: 5,
      orderBy: { moisConcerne: "desc" },
    }),
  ]);

  return { locataires, appartements, baux, paiements };
}
