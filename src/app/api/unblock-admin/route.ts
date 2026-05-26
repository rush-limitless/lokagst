import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.NEXTAUTH_SECRET && secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const users = await prisma.utilisateur.findMany({
    where: { role: "GESTIONNAIRE" },
    select: { id: true, email: true, statut: true, tentativesEchouees: true, bloqueJusqua: true },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.NEXTAUTH_SECRET && secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.utilisateur.updateMany({
    where: { role: "GESTIONNAIRE" },
    data: { tentativesEchouees: 0, bloqueJusqua: null, statut: "ACTIF" },
  });

  return NextResponse.json({ ok: true, message: "Comptes gestionnaires débloqués" });
}
