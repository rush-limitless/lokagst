import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getReportingComplet } from "@/actions/reporting-complet";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getReportingComplet();
  const now = new Date();
  const moisLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const totalEncaisse = data.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0);
  const totalAttendu = data.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0);
  const totalDifference = totalEncaisse - totalAttendu;
  const nbImpayes = data.suiviPaiements.filter((r: any) => r.difference < 0).length;
  const nbAvance = data.suiviPaiements.filter((r: any) => r.difference > 0).length;

  const impayes = data.suiviPaiements.filter((r: any) => r.difference < 0)
    .map((r: any) => `<tr><td style="padding:6px;border:1px solid #ddd">${r.locataire}</td><td style="padding:6px;border:1px solid #ddd">${r.logement}</td><td style="padding:6px;border:1px solid #ddd;color:red;font-weight:bold">${r.difference.toLocaleString()} FCFA</td></tr>`)
    .join("");

  const html = `
    <h2 style="color:#1B6B9E">📊 Rapport mensuel ImmoGest — ${moisLabel}</h2>
    <table style="border-collapse:collapse;margin:15px 0">
      <tr><td style="padding:8px;background:#e8f5e9;border:1px solid #ddd"><strong>Total encaissé</strong></td><td style="padding:8px;border:1px solid #ddd">${totalEncaisse.toLocaleString()} FCFA</td></tr>
      <tr><td style="padding:8px;background:#e3f2fd;border:1px solid #ddd"><strong>Total attendu</strong></td><td style="padding:8px;border:1px solid #ddd">${totalAttendu.toLocaleString()} FCFA</td></tr>
      <tr><td style="padding:8px;background:${totalDifference >= 0 ? "#e8f5e9" : "#ffebee"};border:1px solid #ddd"><strong>Différence</strong></td><td style="padding:8px;border:1px solid #ddd;color:${totalDifference >= 0 ? "green" : "red"};font-weight:bold">${totalDifference.toLocaleString()} FCFA</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><strong>Locataires en retard</strong></td><td style="padding:8px;border:1px solid #ddd;color:red">${nbImpayes}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><strong>Locataires en avance</strong></td><td style="padding:8px;border:1px solid #ddd;color:green">${nbAvance}</td></tr>
    </table>
    ${nbImpayes > 0 ? `<h3 style="color:#c62828">Détail des impayés</h3><table style="border-collapse:collapse"><tr style="background:#1B6B9E;color:white"><th style="padding:6px;border:1px solid #ddd">Locataire</th><th style="padding:6px;border:1px solid #ddd">Logement</th><th style="padding:6px;border:1px solid #ddd">Différence</th></tr>${impayes}</table>` : "<p style='color:green'>✅ Tous les locataires sont à jour</p>"}
    <p style="color:#999;font-size:12px;margin-top:20px">— ImmoGest v1.0.0 · IMMOSTAR SCI</p>
  `;

  // Send to super admin
  const superAdmin = await prisma.utilisateur.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (superAdmin) {
    await sendEmail(superAdmin.email, `Rapport mensuel ImmoGest — ${moisLabel}`, html);
  }

  return NextResponse.json({ ok: true, sentTo: superAdmin?.email, mois: moisLabel });
}
