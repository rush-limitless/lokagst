import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const immeubles = await prisma.immeuble.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });
  return NextResponse.json(immeubles);
}
