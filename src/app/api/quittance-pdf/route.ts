import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const paiementId = req.nextUrl.searchParams.get("id");
  if (!paiementId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const paiement = await prisma.paiement.findUnique({ where: { id: paiementId }, include: { bail: { include: { locataire: true, appartement: { include: { immeuble: true } } } } } });
  if (!paiement) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });

  const b = paiement.bail;
  const moisLabel = new Date(paiement.moisConcerne).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quittance — ${moisLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#1a1a1a;padding:50px;max-width:700px;margin:0 auto}
.header{text-align:center;margin-bottom:40px}.header h1{font-size:14px;letter-spacing:3px;text-transform:uppercase;color:#1B6B9E}
.header h2{font-size:22px;margin-top:10px}
.box{border:1px solid #ddd;padding:20px;margin:20px 0;border-radius:4px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0}
.row:last-child{border:none}.row .label{color:#666}.row .value{font-weight:bold}
.total{font-size:20px;text-align:center;margin:20px 0;padding:15px;background:#f8f9fa;border-radius:4px}
.footer{margin-top:50px;text-align:center;font-size:11px;color:#999}
.signature{margin-top:40px;display:flex;justify-content:space-between}
.signature div{text-align:center;width:45%}.signature div p{margin-top:40px;border-top:1px solid #333;padding-top:5px;font-size:11px}
@media print{body{padding:30px}@page{margin:2cm}}
</style></head><body>
<div class="header"><h1>IMMOSTAR SCI</h1><h2>Quittance de Loyer</h2><p style="color:#666;margin-top:5px;font-size:13px">${moisLabel}</p></div>

<div class="box">
<div class="row"><span class="label">Locataire</span><span class="value">${b.locataire.prenom} ${b.locataire.nom}</span></div>
<div class="row"><span class="label">Logement</span><span class="value">${b.appartement.numero} — ${b.appartement.immeuble?.nom || ""}</span></div>
<div class="row"><span class="label">Période</span><span class="value">${moisLabel}</span></div>
<div class="row"><span class="label">Date de paiement</span><span class="value">${new Date(paiement.datePaiement).toLocaleDateString("fr-FR")}</span></div>
</div>

<div class="box">
<div class="row"><span class="label">Loyer</span><span class="value">${fmt(b.montantLoyer)} FCFA</span></div>
<div class="row"><span class="label">Charges</span><span class="value">${fmt(b.totalCharges)} FCFA</span></div>
<div class="row"><span class="label">Mode de paiement</span><span class="value">${paiement.modePaiement || "—"}</span></div>
</div>

<div class="total"><strong>Montant réglé : ${fmt(paiement.montant)} FCFA</strong></div>

<p style="text-align:center;font-size:12px;color:#666;margin:20px 0">Le bailleur soussigné déclare avoir reçu la somme de ${fmt(paiement.montant)} FCFA du locataire ci-dessus désigné, en paiement du loyer et des charges pour la période indiquée.</p>

<div class="signature">
<div><p>Le bailleur</p></div>
<div><p>Le locataire</p></div>
</div>

<div class="footer"><p>IMMOSTAR SCI — Yaoundé, Nkolfoulou</p><p>Document généré par ImmoGest</p></div>
<script>window.onload=()=>window.print()</script>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
