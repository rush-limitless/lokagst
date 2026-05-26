import { getAppartement } from "@/actions/appartements";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, ETAGE_LABELS, TYPE_LABELS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModifierAppartForm } from "./modifier-form";
import { SupprimerAppartButton } from "./supprimer-button";
import { Home, MapPin, Layers, Wallet, Users, Calendar } from "lucide-react";

const ETAGE_COLORS: Record<string, string> = {
  RDC: "from-emerald-500 to-teal-600",
  PREMIER: "from-sky-500 to-blue-600",
  DEUXIEME: "from-violet-500 to-purple-600",
  TROISIEME: "from-amber-500 to-orange-600",
  QUATRIEME: "from-rose-500 to-pink-600",
  CINQUIEME: "from-fuchsia-500 to-purple-600",
};

export default async function AppartementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appart = await getAppartement(id);
  if (!appart) notFound();

  const bailActif = appart.baux.find((b) => b.statut === "ACTIF");
  const gradient = ETAGE_COLORS[appart.etage] || "from-sky-500 to-blue-600";

  return (
    <div className="space-y-6 animate-in">
      <Link href="/appartements" className="text-muted-foreground hover:text-foreground text-sm">← Retour aux appartements</Link>

      {/* Header gradient */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Home className="size-6" /></div>
              <div>
                <h1 className="text-2xl font-bold">{appart.numero}</h1>
                <p className="text-white/70 text-sm flex items-center gap-1"><MapPin className="size-3" /> {ETAGE_LABELS[appart.etage]}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-3 py-1 ${appart.statut === "LIBRE" ? "bg-emerald-400/20 text-emerald-100 border-emerald-300/30" : "bg-white/20 text-white border-white/30"}`}>
              {appart.statut === "LIBRE" ? "Libre" : "Occupé"}
            </Badge>
            <SupprimerAppartButton id={appart.id} hasActiveBail={!!bailActif} />
          </div>
        </div>
      </div>

      {/* Infos grille */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center"><Layers className="size-4 text-sky-600" /></div>
            <div><p className="text-[10px] text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground">{TYPE_LABELS[appart.type] || appart.type}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Wallet className="size-4 text-emerald-600" /></div>
            <div><p className="text-[10px] text-muted-foreground">Loyer</p><p className="text-sm font-medium text-foreground">{formatFCFA(appart.loyerBase)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center"><Users className="size-4 text-violet-600" /></div>
            <div><p className="text-[10px] text-muted-foreground">Locataire</p><p className="text-sm font-medium text-foreground">{bailActif ? `${bailActif.locataire.prenom} ${bailActif.locataire.nom}` : "—"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center"><Calendar className="size-4 text-amber-600" /></div>
            <div><p className="text-[10px] text-muted-foreground">Baux</p><p className="text-sm font-medium text-foreground">{appart.baux.length} bail(s)</p></div>
          </CardContent>
        </Card>
      </div>

      <ModifierAppartForm appart={appart} />

      {/* Historique des baux */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Historique des occupants</CardTitle></CardHeader>
        <CardContent>
          {appart.baux.length === 0 ? (
            <div className="text-center py-6"><div className="text-3xl mb-2">📭</div><p className="text-muted-foreground text-sm">Aucun bail enregistré</p></div>
          ) : (
            <div className="space-y-2">
              {appart.baux.map((b) => (
                <Link key={b.id} href={`/baux/${b.id}`} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{b.locataire.prenom[0]}{b.locataire.nom[0]}</div>
                    <div>
                      <span className="font-medium text-foreground text-sm">{b.locataire.prenom} {b.locataire.nom}</span>
                      <p className="text-[10px] text-muted-foreground">{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatFCFA(b.montantLoyer)}/mois</span>
                    <StatusBadge status={b.statut.toLowerCase()} label={STATUT_BAIL_LABELS[b.statut]} animate={b.statut === "ACTIF"} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
