import { getSituationGlobale } from "@/actions/situation-globale";
import { formatFCFA, PERIODICITE_LABELS } from "@/lib/utils";

export default async function FactureDettesPage({ searchParams }: { searchParams: Promise<{ locataire?: string }> }) {
  const { locataire: locId } = await searchParams;
  const situations = await getSituationGlobale();
  const impayes = locId
    ? situations.filter((s) => s.locataireId === locId && !s.aJour)
    : situations.filter((s) => !s.aJour);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const totalLoyerDu = impayes.reduce((s, r) => s + r.montantLoyerDu, 0);
  const totalChargesDu = impayes.reduce((s, r) => s + r.montantChargesDu, 0);
  const totalGlobalDu = impayes.reduce((s, r) => s + r.totalDu, 0);
  const titre = locId && impayes.length > 0 ? `FACTURE DE DETTES — ${impayes[0].locataire.toUpperCase()}` : "ÉTAT DES DETTES";

  return (
    <html>
      <head>
        <title>{titre} — IMMOSTAR SCI — {dateStr}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } #printBtn { display: none; } }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #1a1a1a; font-size: 12px; }
          .header { text-align: center; border-bottom: 3px solid #1B6B9E; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #1B6B9E; margin: 0; font-size: 22px; }
          .header p { color: #666; margin: 4px 0; }
          .summary { display: flex; gap: 15px; margin-bottom: 20px; }
          .summary-card { flex: 1; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; text-align: center; }
          .summary-card .value { font-size: 18px; font-weight: bold; }
          .summary-card .label { font-size: 10px; color: #666; margin-top: 2px; }
          .red { color: #dc2626; } .orange { color: #ea580c; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1B6B9E; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
          td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .total-row { font-weight: bold; background: #fef2f2 !important; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #e0e0e0; padding-top: 10px; }
          .detail { font-size: 10px; color: #666; }
          .month-detail { font-size: 10px; color: #888; margin-top: 4px; }
        `}} />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('DOMContentLoaded',function(){document.getElementById('printBtn').addEventListener('click',function(){window.print()})})` }} />
        <button id="printBtn" style={{ background: "#1B6B9E", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", margin: "15px auto", display: "block" }}>
          🖨️ Imprimer / Enregistrer en PDF
        </button>

        <div className="header">
          <h1>IMMOSTAR SCI</h1>
          <p>Yaoundé — Nkolfoulou</p>
          <p style={{ fontSize: "16px", fontWeight: "bold", marginTop: "10px", color: "#1a1a1a" }}>
            {titre} AU {dateStr.toUpperCase()}
          </p>
        </div>

        <div className="summary">
          <div className="summary-card">
            <div className="value red">{impayes.length}</div>
            <div className="label">{locId ? "Bail(s) en retard" : "Locataires en retard"}</div>
          </div>
          <div className="summary-card">
            <div className="value red">{formatFCFA(totalLoyerDu)}</div>
            <div className="label">Loyers impayés</div>
          </div>
          <div className="summary-card">
            <div className="value orange">{formatFCFA(totalChargesDu)}</div>
            <div className="label">Charges impayées</div>
          </div>
          <div className="summary-card">
            <div className="value red">{formatFCFA(totalGlobalDu)}</div>
            <div className="label">TOTAL DÛ</div>
          </div>
        </div>

        {impayes.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#16a34a", fontSize: "16px" }}>✅ Aucun impayé</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Locataire</th>
                <th>Appartement</th>
                <th>Loyer/mois</th>
                <th>Mois impayés</th>
                <th>Loyer dû</th>
                <th>Charges dues</th>
                <th>Total dû</th>
              </tr>
            </thead>
            <tbody>
              {impayes.map((s, i) => (
                <tr key={s.locataireId + s.appartement}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{s.locataire}</strong>
                    <div className="detail">{PERIODICITE_LABELS[s.periodicite] || s.periodicite}</div>
                    {/* Detail of unpaid months */}
                    <div className="month-detail">
                      {s.detailMois.filter((m) => !m.loyerPaye).map((m) => m.mois).join(", ")}
                    </div>
                  </td>
                  <td>{s.appartement}</td>
                  <td>{formatFCFA(s.loyerMensuel)}</td>
                  <td style={{ color: "#dc2626", fontWeight: "bold" }}>{s.moisLoyerImpayes}</td>
                  <td style={{ color: "#dc2626" }}>{formatFCFA(s.montantLoyerDu)}</td>
                  <td style={{ color: "#ea580c" }}>{formatFCFA(s.montantChargesDu)}</td>
                  <td style={{ fontWeight: "bold", color: "#dc2626" }}>{formatFCFA(s.totalDu)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={5} style={{ textAlign: "right", fontWeight: "bold" }}>TOTAL</td>
                <td style={{ color: "#dc2626" }}>{formatFCFA(totalLoyerDu)}</td>
                <td style={{ color: "#ea580c" }}>{formatFCFA(totalChargesDu)}</td>
                <td style={{ color: "#dc2626", fontSize: "14px" }}>{formatFCFA(totalGlobalDu)}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="footer">
          <p>Document généré le {dateStr} — ImmoGest v1.0.0 — IMMOSTAR SCI</p>
          <p>Ce document est un état des dettes à date et ne constitue pas une mise en demeure.</p>
        </div>
      </body>
    </html>
  );
}
