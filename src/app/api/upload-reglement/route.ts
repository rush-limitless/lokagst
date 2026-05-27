import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!role || !["GESTIONNAIRE", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { locataireId, url } = await req.json();
  if (!locataireId || !url) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  await prisma.locataire.update({ where: { id: locataireId }, data: { reglementInterieur: url } });
  return NextResponse.json({ ok: true });
}
