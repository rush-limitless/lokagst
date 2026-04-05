import { getMonEspace } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, ETAGE_LABELS } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MonEspace() {
  const data = await getMonEspace();
  if (!data) return <p className="text-muted-foreground p-8 text-center">Aucune donnée trouvée.</p>;

  const bail = data.baux[0];
  const now = new Date();
  const joursRestants = bail ? Math.ceil((new Date(bail.dateFin).getTime() - now.getTime()) / 86400000) : 0;

  return (
    <div className="space-y-6">
      {/* Hero card style bancaire */}
      <div className="bg-gradient-to-br from-[#0d3b5e] to-[#1B6B9E] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-sky-200 text-sm">Bienvenue</p>
          <h1 className="text-2xl font-bold mt-1">{data.prenom} {data.nom}</h1>
          {bail && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sky-300 text-xs">Appartement</p>
                <p className="text-xl font-bold">{bail.appartement.numero}</p>
                <p className="text-sky-200 text-xs">{ETAGE_LABELS[bail.appartement.etage]}</p>
              </div>
              <div>
                <p className="text-sky-300 text-xs">Loyer mensuel</p>
                <p className="text-xl font-bold">{formatFCFA(bail.montantLoyer)}</p>
              </div>
              <div>
                <p className="text-sky-300 text-xs">Fin du bail</p>
                <p className="text-xl font-bold">{joursRestants}j</p>
                <p className="text-sky-200 text-xs">{formatDate(bail.dateFin)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Derniers paiements */}
      {bail && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Derniers paiements</h3>
              <Link href="/mon-espace/paiements" className="text-xs text-primary hover:underline">Voir tout →</Link>
            </div>
            {bail.paiements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-muted-foreground text-sm">Aucun paiement enregistré</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bail.paiements.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.statut === "PAYE" ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{formatDate(p.moisConcerne)}</p>
                        <p className="text-xs text-muted-foreground">{p.modePaiement === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatFCFA(p.montant)}</p>
                      <Badge variant="outline" className={`text-[10px] ${p.statut === "PAYE" ? "text-emerald-600 border-emerald-300" : "text-orange-600 border-orange-300"}`}>
                        {p.statut === "PAYE" ? "Payé" : "Partiel"}
                      </Badge>
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
