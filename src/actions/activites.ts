"use server";

import { prisma } from "@/lib/prisma";

export async function getDernieresActivites() {
  const [paiements, baux] = await Promise.all([
    prisma.paiement.findMany({
      take: 5, orderBy: { creeLe: "desc" },
      include: { bail: { include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } } },
    }),
    prisma.bail.findMany({
      take: 5, orderBy: { creeLe: "desc" },
      include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } },
    }),
  ]);

  const activites = [
    ...paiements.map((p) => ({
      type: "paiement" as const,
      icon: "💰",
      message: `${p.bail.locataire.prenom} ${p.bail.locataire.nom} — ${p.montant.toLocaleString()} FCFA (${p.bail.appartement.numero})`,
      date: p.creeLe,
    })),
    ...baux.map((b) => ({
      type: "bail" as const,
      icon: "📄",
      message: `Bail ${b.locataire.prenom} ${b.locataire.nom} — ${b.appartement.numero} (${b.statut})`,
      date: b.creeLe,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  return activites;
}
