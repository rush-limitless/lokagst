import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

async function checkSuperAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await checkSuperAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const gestionnaires = await prisma.utilisateur.findMany({
    where: { role: "GESTIONNAIRE" },
    select: { id: true, email: true, statut: true, creeLe: true },
    orderBy: { email: "asc" },
  });
  return NextResponse.json(gestionnaires);
}

export async function POST(req: Request) {
  if (!await checkSuperAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { email, motDePasse } = await req.json();
  if (!email || !motDePasse) return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Cet email existe déjà" }, { status: 400 });
  const hashed = await hash(motDePasse, 12);
  const user = await prisma.utilisateur.create({ data: { email, motDePasse: hashed, role: "GESTIONNAIRE" } });
  return NextResponse.json({ id: user.id, email: user.email });
}

export async function PUT(req: Request) {
  if (!await checkSuperAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { id, email, motDePasse } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
  const data: any = {};
  if (email) data.email = email;
  if (motDePasse) data.motDePasse = await hash(motDePasse, 12);
  await prisma.utilisateur.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!await checkSuperAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
  await prisma.utilisateur.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
