import { getBaux } from "@/actions/baux";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

export default async function BauxPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const baux = await getBaux(statut ? { statut } : undefined);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Contrats / Baux</h1>
        <Link href="/baux/nouveau"><Button>+ Nouveau bail</Button></Link>
      </div>
      <div className="flex gap-1 flex-wrap">
        <Link href="/baux" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!statut ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous</Link>
        <Link href="/baux?statut=ACTIF" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "ACTIF" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Actifs</Link>
        <Link href="/baux?statut=SUSPENDU" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "SUSPENDU" ? "bg-orange-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Suspendus</Link>
        <Link href="/baux?statut=EXPIRE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "EXPIRE" ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Expirés</Link>
      </div>
      <div className="bg-card rounded-xl border overflow-x-auto table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
            <tr><th className="p-3 text-left">Locataire</th><th className="p-3">Appart.</th><th className="p-3">Début</th><th className="p-3">Fin</th><th className="p-3 text-right">Total/mois</th><th className="p-3">Jours rest.</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {baux.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar nom={b.locataire.nom} prenom={b.locataire.prenom} photo={b.locataire.photo} size="sm" />
                    <Link href={`/locataires`} className="font-medium text-foreground hover:text-primary">{b.locataire.prenom} {b.locataire.nom}</Link>
                  </div>
                </td>
                <td className="p-3 text-center text-muted-foreground">{b.appartement.numero}</td>
                <td className="p-3 text-center text-muted-foreground">{formatDate(b.dateDebut)}</td>
                <td className="p-3 text-center text-muted-foreground">{formatDate(b.dateFin)}</td>
                <td className="p-3 text-right font-medium text-foreground">{formatFCFA(b.totalMensuel)}</td>
                <td className="p-3 text-center"><span className={`text-xs font-medium ${Math.ceil((new Date(b.dateFin).getTime() - Date.now()) / 86400000) < 30 ? "text-red-600" : Math.ceil((new Date(b.dateFin).getTime() - Date.now()) / 86400000) < 90 ? "text-orange-600" : "text-muted-foreground"}`}>{Math.ceil((new Date(b.dateFin).getTime() - Date.now()) / 86400000)}j</span></td>
                <td className="p-3"><StatusBadge status={b.statut.toLowerCase()} label={STATUT_BAIL_LABELS[b.statut]} /></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Link href={`/baux/${b.id}`} className="text-primary text-xs hover:underline font-medium">Voir</Link>
                  </div>
                </td>
              </tr>
            ))}
            {baux.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aucun bail</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
