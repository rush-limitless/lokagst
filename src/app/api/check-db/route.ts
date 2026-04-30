export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [locataires, baux, paiements, appartements] = await Promise.all([
    prisma.locataire.count(),
    prisma.bail.count(),
    prisma.paiement.count(),
    prisma.appartement.count(),
  ]);

  const bauxParStatut = await prisma.bail.groupBy({ by: ["statut"], _count: true });
  const locParStatut = await prisma.locataire.groupBy({ by: ["statut"], _count: true });

  // Derniers paiements supprimés ne sont pas traçables, mais on peut voir les paiements récents
  const derniersPaiements = await prisma.paiement.findMany({
    take: 5,
    orderBy: { creeLe: "desc" },
    select: { id: true, montant: true, moisConcerne: true, creeLe: true, bail: { select: { locataire: { select: { nom: true, prenom: true } } } } },
  });

  return NextResponse.json({
    totaux: { locataires, baux, paiements, appartements },
    bauxParStatut,
    locParStatut,
    derniersPaiements,
  });
}
