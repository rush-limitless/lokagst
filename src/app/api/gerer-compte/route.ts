import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function PUT(req: Request) {
  const { utilisateurId, email, motDePasse } = await req.json();
  if (!utilisateurId) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const data: any = {};
  if (email) data.email = email;
  if (motDePasse) data.motDePasse = await hash(motDePasse, 12);

  await prisma.utilisateur.update({ where: { id: utilisateurId }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { utilisateurId } = await req.json();
  if (!utilisateurId) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  await prisma.utilisateur.delete({ where: { id: utilisateurId } });
  return NextResponse.json({ ok: true });
}
