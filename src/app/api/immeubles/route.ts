import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const immeubles = await prisma.immeuble.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });
  return NextResponse.json(immeubles);
}
