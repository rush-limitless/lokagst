import { getBaux } from "@/actions/baux";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, ETAGE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

const ETAGE_ORDER = ["CINQUIEME", "QUATRIEME", "TROISIEME", "DEUXIEME", "PREMIER", "RDC", "AUTRE"];

export default async function BauxPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const baux = await getBaux(statut ? { statut } : undefined);

  // Group by immeuble then etage
  const grouped: { imm: string; etage: string; baux: typeof baux }[] = [];
  const byImm = new Map<string, typeof baux>();
  for (const b of baux) {
    const immNom = b.appartement.immeuble?.nom || "Sans immeuble";
    if (!byImm.has(immNom)) byImm.set(immNom, []);
    byImm.get(immNom)!.push(b);
  }
  for (const [immNom, immBaux] of Array.from(byImm)) {
    const byEtage = new Map<string, typeof baux>();
    for (const b of immBaux) {
      const e = b.appartement.etage;
      if (!byEtage.has(e)) byEtage.set(e, []);
      byEtage.get(e)!.push(b);
    }
    for (const ek of ETAGE_ORDER) {
      const eb = byEtage.get(ek);
      if (eb) grouped.push({ imm: immNom, etage: ETAGE_LABELS[ek] || ek, baux: eb });
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Contrats / Baux</h1>
        <Link href="/baux/nouveau"><Button>+ Nouveau bail</Button></Link>
      </div>
      <div className="flex gap-1 flex-wrap">
        <Link href="/baux" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!statut ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous ({baux.length})</Link>
        <Link href="/baux?statut=ACTIF" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "ACTIF" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Actifs ({baux.filter((b) => b.statut === "ACTIF").length})</Link>
        <Link href="/baux?statut=TERMINE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "TERMINE" ? "bg-gray-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Terminés</Link>
        <Link href="/baux?statut=RESILIE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "RESILIE" ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Résiliés</Link>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-12"><div className="text-4xl mb-3">📄</div><p className="text-muted-foreground">Aucun bail</p></div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ imm, etage, baux: gb }) => (
            <div key={`${imm}-${etage}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary">{imm}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{etage}</span>
                <span className="text-xs text-muted-foreground">({gb.length})</span>
              </div>
              <div className="bg-card rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                    <tr><th className="p-3 text-left">Locataire</th><th className="p-3">Appart.</th><th className="p-3">Début</th><th className="p-3">Fin</th><th className="p-3 text-right">Total/mois</th><th className="p-3">Jours rest.</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {gb.map((b) => {
                      const jours = Math.ceil((new Date(b.dateFin).getTime() - Date.now()) / 86400000);
                      return (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3"><div className="flex items-center gap-2"><UserAvatar nom={b.locataire.nom} prenom={b.locataire.prenom} photo={b.locataire.photo} size="sm" /><span className="font-medium text-foreground">{b.locataire.prenom} {b.locataire.nom}</span></div></td>
                          <td className="p-3 text-center text-muted-foreground">{b.appartement.numero}</td>
                          <td className="p-3 text-center text-muted-foreground">{formatDate(b.dateDebut)}</td>
                          <td className="p-3 text-center text-muted-foreground">{formatDate(b.dateFin)}</td>
                          <td className="p-3 text-right font-medium text-foreground">{formatFCFA(b.totalMensuel)}</td>
                          <td className="p-3 text-center"><span className={`text-xs font-medium ${jours < 30 ? "text-red-600" : jours < 90 ? "text-orange-600" : "text-muted-foreground"}`}>{jours}j</span></td>
                          <td className="p-3"><StatusBadge status={b.statut.toLowerCase()} label={STATUT_BAIL_LABELS[b.statut]} /></td>
                          <td className="p-3"><Link href={`/baux/${b.id}`} className="text-primary text-xs hover:underline font-medium">Voir</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
