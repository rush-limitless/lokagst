import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const loc = await prisma.locataire.findFirst({
    where: { nom: { contains: "SIPEWO", mode: "insensitive" } },
    include: { baux: { where: { statut: "ACTIF" }, orderBy: { creeLe: "desc" }, take: 1 } },
  });

  if (!loc || loc.baux.length === 0) {
    return NextResponse.json({ error: "Locataire ou bail introuvable" });
  }

  const bail = loc.baux[0];
  const nbJours = parseInt(req.nextUrl.searchParams.get("jours") || "12");
  const dateDebut = new Date(bail.dateDebut);
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateFin.getDate() + nbJours);

  await prisma.bail.update({
    where: { id: bail.id },
    data: { dateFin, dureeMois: 1, periodicite: "JOURNALIER" },
  });

  return NextResponse.json({
    ok: true,
    locataire: `${loc.prenom} ${loc.nom}`,
    bailId: bail.id,
    dateDebut: dateDebut.toISOString().slice(0, 10),
    dateFin: dateFin.toISOString().slice(0, 10),
    nbJours,
  });
}
