import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  // Reset admin account: unblock + reset password + ensure SUPER_ADMIN
  const mdp = await hash("admin123", 12);
  const admin = await prisma.utilisateur.findUnique({ where: { email: "admin@immostar.cm" } });
  
  if (!admin) {
    await prisma.utilisateur.create({ data: { email: "admin@immostar.cm", motDePasse: mdp, role: "SUPER_ADMIN" } });
    return NextResponse.json({ ok: true, action: "Compte admin créé" });
  }

  await prisma.utilisateur.update({
    where: { id: admin.id },
    data: { motDePasse: mdp, role: "SUPER_ADMIN" as any, tentativesEchouees: 0, bloqueJusqua: null },
  });

  return NextResponse.json({ 
    ok: true, 
    action: "Compte admin réinitialisé",
    details: {
      email: admin.email,
      role: "SUPER_ADMIN",
      wasBlocked: !!admin.bloqueJusqua,
      failedAttempts: admin.tentativesEchouees,
    }
  });
}
