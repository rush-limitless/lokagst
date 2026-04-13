import { getSituationGlobale } from "@/actions/situation-globale";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { ImprimerDettesButton } from "./imprimer-dettes";

export default async function SituationPage({ searchParams }: { searchParams: Promise<{ filtre?: string }> }) {
  const { filtre } = await searchParams;
  const situations = await getSituationGlobale();

  const filtered = filtre === "ajour" ? situations.filter((s) => s.aJour)
    : filtre === "impayes" ? situations.filter((s) => !s.aJour)
    : situations;

  const totalImpayes = situations.filter((s) => !s.aJour).length;
  const totalAJour = situations.filter((s) => s.aJour).length;
  const totalLoyerDu = situations.reduce((s, r) => s + r.montantLoyerDu, 0);
  const totalChargesDu = situations.reduce((s, r) => s + r.montantChargesDu, 0);
  const totalGlobalDu = situations.reduce((s, r) => s + r.totalDu, 0);

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Situation des locataires</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{situations.length}</div><p className="text-xs text-muted-foreground">Total locataires</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-emerald-600">{totalAJour}</div><p className="text-xs text-muted-foreground">À jour</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-red-600">{totalImpayes}</div><p className="text-xs text-muted-foreground">En retard</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-xl font-bold text-red-600">{formatFCFA(totalLoyerDu)}</div><p className="text-xs text-muted-foreground">Loyers impayés</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-xl font-bold text-orange-600">{formatFCFA(totalChargesDu)}</div><p className="text-xs text-muted-foreground">Charges impayées</p></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <Link href="/situation" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filtre ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous ({situations.length})</Link>
        <Link href="/situation?filtre=ajour" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtre === "ajour" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>✅ À jour ({totalAJour})</Link>
        <Link href="/situation?filtre=impayes" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtre === "impayes" ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>❌ Impayés ({totalImpayes})</Link>
        <div className="ml-auto">
          <ImprimerDettesButton />
        </div>
      </div>

      <div className="text-right text-sm font-bold text-red-600">Total global dû : {formatFCFA(totalGlobalDu)}</div>

      <div className="space-y-3">
        {filtered.map((s) => (
          <Link key={s.locataireId} href={`/locataires/${s.locataireId}`} className="block">
            <div className={`bg-card border rounded-xl p-4 hover:shadow-md transition-all ${s.aJour ? "border-emerald-200 dark:border-emerald-900" : "border-red-200 dark:border-red-900"}`}>
              <div className="flex items-center gap-4">
                <UserAvatar nom={s.locataire.split(" ").pop() || ""} prenom={s.locataire.split(" ")[0]} photo={s.photo} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{s.locataire}</p>
                    <span className="text-xs text-muted-foreground">({s.appartement})</span>
                    <StatusBadge status={s.aJour ? "actif" : "urgente"} label={s.aJour ? "À jour" : "Impayé"} />
                  </div>
                  {!s.aJour && (
                    <div className="flex gap-4 mt-2 text-xs">
                      {s.moisLoyerImpayes > 0 && <span className="text-red-600">🏠 Loyer : {s.moisLoyerImpayes} mois — {formatFCFA(s.montantLoyerDu)}</span>}
                      {s.moisChargesImpayes > 0 && <span className="text-orange-600">⚡ Charges : {s.moisChargesImpayes} mois — {formatFCFA(s.montantChargesDu)}</span>}
                    </div>
                  )}
                  {/* Mini historique 12 derniers mois */}
                  <div className="flex gap-0.5 mt-2">
                    {s.detailMois.map((m, i) => (
                      <div key={i} title={`${m.mois} — ${m.montantPaye.toLocaleString()} FCFA`} className={`w-3 h-3 rounded-sm ${m.loyerPaye && m.chargesPaye ? "bg-emerald-500" : m.loyerPaye ? "bg-orange-400" : "bg-red-400"}`} />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  {s.aJour ? (
                    <span className="text-emerald-600 font-bold text-sm">0 FCFA</span>
                  ) : (
                    <span className="text-red-600 font-bold text-sm">{formatFCFA(s.totalDu)}</span>
                  )}
                  <p className="text-[10px] text-muted-foreground">{formatFCFA(s.totalMensuel)}/mois</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
