import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { locataireId, url } = await req.json();
  if (!locataireId || !url) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  await prisma.locataire.update({ where: { id: locataireId }, data: { reglementInterieur: url } });
  return NextResponse.json({ ok: true });
}
