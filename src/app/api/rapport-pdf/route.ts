import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role === "LOCATAIRE") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const moisLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [paiementsMois, baux, depensesMois, totalApparts, appartsLibres] = await Promise.all([
    prisma.paiement.findMany({ where: { datePaiement: { gte: debutMois, lt: finMois } }, include: { bail: { include: { locataire: true, appartement: true } } }, orderBy: { datePaiement: "desc" } }),
    prisma.bail.findMany({ where: { statut: { in: ["ACTIF", "SUSPENDU"] } }, include: { locataire: true, appartement: true, paiements: true } }),
    prisma.depense.aggregate({ where: { date: { gte: debutMois, lt: finMois } }, _sum: { montant: true }, _count: true }),
    prisma.appartement.count(),
    prisma.appartement.count({ where: { statut: "LIBRE" } }),
  ]);

  const totalEncaisse = paiementsMois.reduce((s, p) => s + p.montant, 0);
  const totalAttendu = baux.filter(b => isMoisEcheance(debutMois, b.dateDebut, b.periodicite)).reduce((s, b) => s + b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1), 0);
  const tauxRecouvrement = totalAttendu > 0 ? Math.round(totalEncaisse / totalAttendu * 100) : 0;
  const taux = Math.round((totalApparts - appartsLibres) / totalApparts * 100);

  // Impayés
  const impayes: { nom: string; appart: string; du: number }[] = [];
  for (const b of baux) {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const debut = new Date(b.dateDebut);
    let totalDu = 0;
    const dm = new Date(Math.max(debut.getTime(), new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime()));
    const d = new Date(dm.getFullYear(), dm.getMonth(), 1);
    while (d <= now) {
      if (isMoisEcheance(d, debut, b.periodicite)) {
        const pDebut = new Date(d);
        const pFin = new Date(d.getFullYear(), d.getMonth() + freq, 1);
        const paye = b.paiements.filter(p => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= pDebut && mp < pFin; }).reduce((s, p) => s + p.montant, 0);
        const moisEcoules = Math.min(freq, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()) + 1);
        const attendu = b.totalMensuel * moisEcoules;
        if (paye < attendu) totalDu += attendu - paye;
      }
      d.setMonth(d.getMonth() + 1);
    }
    if (totalDu > 0) impayes.push({ nom: `${b.locataire.prenom} ${b.locataire.nom}`, appart: b.appartement.numero, du: totalDu });
  }
  impayes.sort((a, b) => b.du - a.du);
  const totalImpayes = impayes.reduce((s, i) => s + i.du, 0);

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport ${moisLabel} — IMMOSTAR SCI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto}
.header{text-align:center;border-bottom:3px solid #1B6B9E;padding-bottom:20px;margin-bottom:30px}
.header h1{color:#1B6B9E;font-size:24px;margin-bottom:4px}.header p{color:#666;font-size:14px}
.logo{font-size:32px;font-weight:900;color:#1B6B9E;letter-spacing:-1px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:30px}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center}
.card .value{font-size:22px;font-weight:700}.card .label{font-size:11px;color:#666;margin-top:4px}
.card.green .value{color:#059669}.card.red .value{color:#dc2626}.card.blue .value{color:#1B6B9E}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
th{background:#f3f4f6;padding:8px 12px;text-align:left;font-weight:600;border-bottom:2px solid #e5e7eb}
td{padding:8px 12px;border-bottom:1px solid #f3f4f6}
tr:hover td{background:#f9fafb}
.section{margin-bottom:30px}.section h2{font-size:16px;font-weight:700;margin-bottom:8px;color:#1B6B9E}
.footer{margin-top:40px;text-align:center;color:#999;font-size:11px;border-top:1px solid #eee;padding-top:16px}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600}
.badge-green{background:#d1fae5;color:#065f46}.badge-red{background:#fee2e2;color:#991b1b}
@media print{body{padding:20px}@page{margin:1.5cm}}
</style></head><body>
<div class="header"><div class="logo">IMMOSTAR SCI</div><h1>Rapport Mensuel — ${moisLabel}</h1><p>Généré le ${now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>

<div class="grid">
<div class="card green"><div class="value">${fmt(totalEncaisse)} FCFA</div><div class="label">Encaissé ce mois</div></div>
<div class="card blue"><div class="value">${tauxRecouvrement}%</div><div class="label">Taux de recouvrement</div></div>
<div class="card red"><div class="value">${fmt(totalImpayes)} FCFA</div><div class="label">Total impayés</div></div>
<div class="card"><div class="value">${taux}%</div><div class="label">Taux d'occupation (${totalApparts - appartsLibres}/${totalApparts})</div></div>
</div>

<div class="section"><h2>💰 Paiements reçus ce mois (${paiementsMois.length})</h2>
<table><thead><tr><th>Date</th><th>Locataire</th><th>Logement</th><th style="text-align:right">Montant</th></tr></thead><tbody>
${paiementsMois.slice(0, 30).map(p => `<tr><td>${new Date(p.datePaiement).toLocaleDateString("fr-FR")}</td><td>${p.bail.locataire.prenom} ${p.bail.locataire.nom}</td><td>${p.bail.appartement.numero}</td><td style="text-align:right;font-weight:600">${fmt(p.montant)} F</td></tr>`).join("")}
</tbody></table></div>

${impayes.length > 0 ? `<div class="section"><h2>⚠️ Impayés (${impayes.length} locataires)</h2>
<table><thead><tr><th>Locataire</th><th>Logement</th><th style="text-align:right">Montant dû</th></tr></thead><tbody>
${impayes.map(i => `<tr><td>${i.nom}</td><td>${i.appart}</td><td style="text-align:right;color:#dc2626;font-weight:600">${fmt(i.du)} F</td></tr>`).join("")}
<tr style="border-top:2px solid #1B6B9E"><td colspan="2" style="font-weight:700">TOTAL</td><td style="text-align:right;font-weight:700;color:#dc2626">${fmt(totalImpayes)} F</td></tr>
</tbody></table></div>` : "<p>✅ Aucun impayé ce mois !</p>"}

<div class="section"><h2>📊 Dépenses du mois</h2><p>${depensesMois._count} dépense(s) — Total : <strong>${fmt(depensesMois._sum.montant || 0)} FCFA</strong></p>
<p style="margin-top:8px"><strong>Bénéfice net : ${fmt(totalEncaisse - (depensesMois._sum.montant || 0))} FCFA</strong></p></div>

<div class="footer"><p>IMMOSTAR SCI — Yaoundé, Nkolfoulou</p><p>Rapport généré automatiquement par ImmoGest v1.0</p></div>
<script>window.onload=()=>window.print()</script>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
