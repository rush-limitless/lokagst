import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "Fonctionnalité bientôt disponible. Contactez l'administrateur." });
}
