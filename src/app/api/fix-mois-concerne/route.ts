import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recale le jour de moisConcerne de tous les paiements sur le jour de dateDebut du bail
export async function POST() {
  const baux = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { paiements: true },
  });

  let corriges = 0;
  for (const bail of baux) {
    const jourEntree = bail.dateDebut.getDate();
    for (const p of bail.paiements) {
      const mc = new Date(p.moisConcerne);
      if (mc.getDate() !== jourEntree) {
        const nouveau = new Date(mc.getFullYear(), mc.getMonth(), jourEntree);
        await prisma.paiement.update({ where: { id: p.id }, data: { moisConcerne: nouveau } });
        corriges++;
      }
    }
  }

  return NextResponse.json({ ok: true, corriges });
}
