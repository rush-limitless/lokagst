import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";

export async function PUT(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!role || !["GESTIONNAIRE", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { utilisateurId, email, motDePasse } = await req.json();
  if (!utilisateurId) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const data: any = {};
  if (email) data.email = email;
  if (motDePasse) data.motDePasse = await hash(motDePasse, 12);

  await prisma.utilisateur.update({ where: { id: utilisateurId }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!role || !["GESTIONNAIRE", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { utilisateurId } = await req.json();
  if (!utilisateurId) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  await prisma.utilisateur.delete({ where: { id: utilisateurId } });
  return NextResponse.json({ ok: true });
}
