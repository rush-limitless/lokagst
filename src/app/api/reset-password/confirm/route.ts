import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Mot de passe trop court (min 6)" }, { status: 400 });

  const user = await prisma.utilisateur.findFirst({
    where: { resetToken: token, resetExpire: { gte: new Date() } },
  });

  if (!user) return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 400 });

  const hashed = await hash(password, 12);
  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { motDePasse: hashed, resetToken: null, resetExpire: null, tentativesEchouees: 0, bloqueJusqua: null },
  });

  return NextResponse.json({ ok: true });
}
