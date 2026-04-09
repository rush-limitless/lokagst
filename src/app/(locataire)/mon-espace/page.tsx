import { getMonEspace, getMaSituation } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, ETAGE_LABELS } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MonEspace() {
  const [data, situation] = await Promise.all([getMonEspace(), getMaSituation()]);
  if (!data) return <p className="text-muted-foreground p-8 text-center">Aucune donn&eacute;e trouv&eacute;e.</p>;

  const bail = data.baux[0];
  const now = new Date();
  const joursRestants = bail ? Math.ceil((new Date(bail.dateFin).getTime() - now.getTime()) / 86400000) : 0;
  const penalites = bail?.penalites || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="mesh-bg bg-gradient-to-br from-[#0d3b5e] to-[#1B6B9E] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative">
          <p className="text-sky-200 text-sm">Bienvenue</p>
          <h1 className="text-2xl font-bold mt-1">{data.prenom} {data.nom}</h1>
          {bail && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div><p className="text-sky-300 text-xs">Appartement</p><p className="text-xl font-bold">{bail.appartement.numero}</p><p className="text-sky-200 text-xs">{ETAGE_LABELS[bail.appartement.etage]}</p></div>
              <div><p className="text-sky-300 text-xs">Loyer mensuel</p><p className="text-xl font-bold">{formatFCFA(bail.montantLoyer)}</p></div>
              <div><p className="text-sky-300 text-xs">Fin du bail</p><p className="text-xl font-bold">{joursRestants}j</p><p className="text-sky-200 text-xs">{formatDate(bail.dateFin)}</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Situation alert */}
      {situation && situation.totalDu > 0 && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">⚠️ Vous avez des impay&eacute;s</p>
                <p className="text-sm text-red-600/80 mt-1">{situation.moisImpayes} mois de retard · Paiement attendu avant le {situation.jourLimite} du mois</p>
                {situation.penalitesTotal > 0 && <p className="text-xs text-red-500 mt-1">P&eacute;nalit&eacute;s accumul&eacute;es : {formatFCFA(situation.penalitesTotal)}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatFCFA(situation.totalDu)}</p>
                <p className="text-xs text-red-500">Total d&ucirc;</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {situation && situation.totalDu === 0 && (
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="pt-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">✅ Vous &ecirc;tes &agrave; jour de vos paiements</p>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-4 gap-3">
        <Link href="/mon-espace/paiements" className="flex flex-col items-center gap-2 p-4 bg-card border rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl">💰</div>
          <span className="text-xs font-medium text-foreground">Payer</span>
        </Link>
        <Link href="/mon-espace/bail" className="flex flex-col items-center gap-2 p-4 bg-card border rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">📄</div>
          <span className="text-xs font-medium text-foreground">Mon bail</span>
        </Link>
        <Link href="/mon-espace/maintenance" className="flex flex-col items-center gap-2 p-4 bg-card border rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">🔧</div>
          <span className="text-xs font-medium text-foreground">Signaler</span>
        </Link>
        <Link href="/mon-espace/messagerie" className="flex flex-col items-center gap-2 p-4 bg-card border rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">💬</div>
          <span className="text-xs font-medium text-foreground">Contacter</span>
        </Link>
      </div>

      {/* Pénalités en cours */}
      {penalites.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold text-foreground mb-3">⚠️ P&eacute;nalit&eacute;s en cours</h3>
            <div className="space-y-2">
              {penalites.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
                  <div><p className="font-medium text-foreground">{p.motif}</p><p className="text-xs text-muted-foreground">{formatDate(p.moisConcerne)}</p></div>
                  <Badge variant="destructive">{formatFCFA(p.montant)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Derniers paiements */}
      {bail && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Derniers paiements</h3>
              <Link href="/mon-espace/paiements" className="text-xs text-primary hover:underline">Voir tout →</Link>
            </div>
            {bail.paiements.length === 0 ? (
              <div className="text-center py-8"><div className="text-4xl mb-3">📭</div><p className="text-muted-foreground text-sm">Aucun paiement enregistr&eacute;</p></div>
            ) : (
              <div className="space-y-2">
                {bail.paiements.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.statut === "PAYE" ? "bg-emerald-500" : "bg-orange-500"}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{formatDate(p.moisConcerne)}</p>
                        <p className="text-xs text-muted-foreground">{p.modePaiement === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatFCFA(p.montant)}</p>
                      <Badge variant="outline" className={`text-[10px] ${p.statut === "PAYE" ? "text-emerald-600 border-emerald-300" : "text-orange-600 border-orange-300"}`}>{p.statut === "PAYE" ? "Pay&eacute;" : "Partiel"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
