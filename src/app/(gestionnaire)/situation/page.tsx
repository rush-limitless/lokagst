import { getSituationGlobale } from "@/actions/situation-globale";
import { formatFCFA } from "@/lib/utils";
import Link from "next/link";
import { ExportSituationButton } from "./export-situation-button";
import { RappelGroupeButton } from "./rappel-groupe-button";
import { CelebrationBanner } from "./celebration-banner";
import { Users, CheckCircle2, XCircle } from "lucide-react";

export default async function SituationPage({ searchParams }: { searchParams: Promise<{ filtre?: string; immeuble?: string }> }) {
  const { filtre, immeuble } = await searchParams;
  const situations = await getSituationGlobale();

  const filtered = situations
    .filter((s) => !immeuble || s.immeuble === immeuble)
    .filter((s) => filtre === "ajour" ? s.aJour : filtre === "impayes" ? !s.aJour : true);

  const immeubles = Array.from(new Set(situations.map((s) => s.immeuble)));
  const totalImpayes = situations.filter((s) => !s.aJour).length;
  const totalAJour = situations.filter((s) => s.aJour).length;
  const totalGlobalDu = situations.reduce((s, r) => s + r.totalDu, 0);

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" /> Situation des locataires
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {situations.length} locataires · <span className="text-emerald-600">{totalAJour} à jour</span> · <span className="text-red-600">{totalImpayes} en retard</span>
            {totalGlobalDu > 0 && <> · Total dû : <span className="font-semibold text-red-600">{formatFCFA(totalGlobalDu)}</span></>}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportSituationButton data={filtered.map((s) => ({ locataire: s.locataire, appartement: s.appartement, totalMensuel: s.totalMensuel, totalDu: s.totalDu, aJour: s.aJour }))} />
          <RappelGroupeButton nbImpayes={totalImpayes} />
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/situation" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filtre && !immeuble ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous ({situations.length})</Link>
        <Link href={`/situation?filtre=ajour${immeuble ? `&immeuble=${encodeURIComponent(immeuble)}` : ""}`} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtre === "ajour" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>✅ À jour ({totalAJour})</Link>
        <Link href={`/situation?filtre=impayes${immeuble ? `&immeuble=${encodeURIComponent(immeuble)}` : ""}`} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtre === "impayes" ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>❌ Impayés ({totalImpayes})</Link>
        <span className="text-muted-foreground text-xs leading-7">|</span>
        {immeubles.map((imm) => (
          <Link key={imm} href={`/situation?${filtre ? `filtre=${filtre}&` : ""}immeuble=${encodeURIComponent(imm)}`} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${immeuble === imm ? "bg-sky-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>{imm}</Link>
        ))}
      </div>

      <CelebrationBanner totalImpayes={totalImpayes} />

      {/* Liste par immeuble */}
      {Array.from(new Set(filtered.map((s) => s.immeuble))).map((imm) => {
        const locs = filtered.filter((s) => s.immeuble === imm);
        return (
          <div key={imm} className="bg-card border rounded-xl overflow-hidden">
            {/* Header immeuble */}
            <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">{imm}</span>
              <span className="text-[10px] text-muted-foreground">{locs.length} locataire(s)</span>
            </div>

            {/* Table */}
            <div className="divide-y divide-border">
              {locs.map((s) => (
                <Link key={s.locataireId} href={`/locataires/${s.locataireId}`} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  {/* Statut */}
                  <div className="flex-shrink-0">
                    {s.aJour
                      ? <CheckCircle2 className="size-5 text-emerald-500" />
                      : <XCircle className="size-5 text-red-500" />
                    }
                  </div>

                  {/* Nom + Appart */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{s.locataire}</p>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.appartement}</span>
                    </div>
                    {!s.aJour && (
                      <p className="text-[11px] text-red-600 mt-0.5">{s.moisLoyerImpayes} mois de retard</p>
                    )}
                  </div>

                  {/* Sparkline */}
                  <div className="hidden md:flex items-end gap-px h-4">
                    {s.detailMois.slice(-6).map((m, i) => {
                      const pct = m.echeance ? Math.min(100, Math.round((m.montantPaye / (s.totalMensuel * (s.periodicite === "MENSUEL" ? 1 : s.periodicite === "TRIMESTRIEL" ? 3 : s.periodicite === "SEMESTRIEL" ? 6 : 12))) * 100)) : -1;
                      const h = pct < 0 ? 3 : Math.max(3, Math.round(pct / 100 * 16));
                      const color = pct < 0 ? "bg-muted" : pct >= 100 ? "bg-emerald-400" : pct > 0 ? "bg-orange-400" : "bg-red-400";
                      return <div key={i} className={`w-1.5 rounded-sm ${color}`} style={{ height: `${h}px` }} />;
                    })}
                  </div>

                  {/* Montant */}
                  <div className="text-right flex-shrink-0 w-28">
                    {s.aJour ? (
                      <span className="text-xs text-emerald-600 font-medium">À jour</span>
                    ) : (
                      <span className="text-sm font-bold text-red-600">{formatFCFA(s.totalDu)}</span>
                    )}
                    <p className="text-[10px] text-muted-foreground">{formatFCFA(s.totalMensuel)}/mois</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
