import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const dans7j = new Date(); dans7j.setDate(dans7j.getDate() + 7);

  const [bauxActifs, ticketsOuverts, messagesNonLus, paiementsEnAttente] = await Promise.all([
    prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: true } }),
    prisma.maintenance.count({ where: { statut: { in: ["SIGNALE", "EN_COURS"] } } }),
    prisma.message.count({ where: { expediteur: "LOCATAIRE", lu: false } }),
    prisma.paiement.count({ where: { valide: false } }),
  ]);

  // Échéances du jour
  const jourDuMois = now.getDate();
  const aEncaisser = bauxActifs.filter((b) => {
    if (b.jourLimitePaiement !== jourDuMois) return false;
    if (!isMoisEcheance(moisCourant, b.dateDebut, b.periodicite)) return false;
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const periodeDebut = new Date(moisCourant);
    const periodeFin = new Date(moisCourant.getFullYear(), moisCourant.getMonth() + freq, 1);
    const paye = b.paiements.filter((p) => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; }).reduce((s, p) => s + p.montant, 0);
    return paye < b.totalMensuel * freq;
  });

  // Baux expirant dans 7 jours
  const bauxExpirants = bauxActifs.filter((b) => b.dateFin >= now && b.dateFin <= dans7j);

  // Impayés totaux
  const impayes = bauxActifs.filter((b) => {
    if (!isMoisEcheance(moisCourant, b.dateDebut, b.periodicite)) return false;
    if (jourDuMois <= b.jourLimitePaiement) return false;
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const periodeDebut = new Date(moisCourant);
    const periodeFin = new Date(moisCourant.getFullYear(), moisCourant.getMonth() + freq, 1);
    const paye = b.paiements.filter((p) => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; }).reduce((s, p) => s + p.montant, 0);
    return paye < b.totalMensuel * freq;
  });

  const dateLabel = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const html = `
    <h2 style="color:#1B6B9E">☀️ Résumé du jour — ${dateLabel}</h2>
    <p style="color:#666">Voici ce qui nécessite votre attention aujourd'hui.</p>

    <table style="border-collapse:collapse;margin:15px 0;width:100%">
      <tr><td style="padding:10px;background:#e3f2fd;border:1px solid #ddd;width:50%"><strong>📅 Échéances aujourd'hui</strong></td><td style="padding:10px;border:1px solid #ddd;font-size:18px;font-weight:bold">${aEncaisser.length}</td></tr>
      <tr><td style="padding:10px;background:#ffebee;border:1px solid #ddd"><strong>🔴 Impayés en cours</strong></td><td style="padding:10px;border:1px solid #ddd;color:red;font-size:18px;font-weight:bold">${impayes.length}</td></tr>
      <tr><td style="padding:10px;background:#fff3e0;border:1px solid #ddd"><strong>🔧 Tickets maintenance</strong></td><td style="padding:10px;border:1px solid #ddd;font-size:18px;font-weight:bold">${ticketsOuverts}</td></tr>
      <tr><td style="padding:10px;background:#f3e5f5;border:1px solid #ddd"><strong>💬 Messages non lus</strong></td><td style="padding:10px;border:1px solid #ddd;font-size:18px;font-weight:bold">${messagesNonLus}</td></tr>
      <tr><td style="padding:10px;background:#e8f5e9;border:1px solid #ddd"><strong>⏳ Paiements à valider</strong></td><td style="padding:10px;border:1px solid #ddd;font-size:18px;font-weight:bold">${paiementsEnAttente}</td></tr>
      ${bauxExpirants.length > 0 ? `<tr><td style="padding:10px;background:#fff8e1;border:1px solid #ddd"><strong>📄 Baux expirant sous 7j</strong></td><td style="padding:10px;border:1px solid #ddd;color:orange;font-size:18px;font-weight:bold">${bauxExpirants.length}</td></tr>` : ""}
    </table>

    ${aEncaisser.length > 0 ? `<h3 style="color:#1B6B9E">💳 À encaisser aujourd'hui</h3><ul style="padding-left:20px">${aEncaisser.map((b) => `<li><strong>${b.locataire.prenom} ${b.locataire.nom}</strong> — ${b.appartement.numero} — ${(b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1)).toLocaleString()} FCFA</li>`).join("")}</ul>` : ""}

    ${impayes.length > 0 ? `<h3 style="color:#c62828">🔴 Locataires en retard</h3><ul style="padding-left:20px">${impayes.map((b) => `<li>${b.locataire.prenom} ${b.locataire.nom} — ${b.appartement.numero}</li>`).join("")}</ul>` : ""}

    <p style="margin-top:20px"><a href="${process.env.NEXTAUTH_URL || "https://lokagst.vercel.app"}/dashboard" style="background:#1B6B9E;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Ouvrir ImmoGest</a></p>
    <p style="color:#999;font-size:11px;margin-top:20px">— ImmoGest · IMMOSTAR SCI · Email automatique quotidien</p>
  `;

  // Envoyer au gestionnaire principal
  const admin = await prisma.utilisateur.findFirst({ where: { role: { in: ["GESTIONNAIRE", "SUPER_ADMIN"] } }, orderBy: { creeLe: "asc" } });
  if (admin) {
    await sendEmail(admin.email, `☀️ Résumé du jour — ${now.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · ${aEncaisser.length} échéance(s), ${impayes.length} impayé(s)`, html);
  }

  return NextResponse.json({ ok: true, sentTo: admin?.email, echeances: aEncaisser.length, impayes: impayes.length });
}
