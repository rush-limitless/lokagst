import { getMaintenances } from "@/actions/maintenance";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STATUT_COLORS: Record<string, string> = {
  SIGNALE: "text-orange-600 border-orange-600",
  EN_COURS: "text-blue-600 border-blue-600",
  RESOLU: "text-green-600 border-green-600",
};
const STATUT_LABELS: Record<string, string> = { SIGNALE: "Signalé", EN_COURS: "En cours", RESOLU: "Résolu" };
const PRIORITE_COLORS: Record<string, string> = { BASSE: "text-muted-foreground", NORMALE: "text-blue-600", URGENTE: "text-red-600" };

export default async function MaintenancePage() {
  const tickets = await getMaintenances();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
        <Link href="/maintenance/nouveau"><Button>+ Signaler</Button></Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["SIGNALE", "EN_COURS", "RESOLU"].map((s) => (
          <div key={s} className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{tickets.filter((t) => t.statut === s).length}</div>
            <p className="text-sm text-muted-foreground">{STATUT_LABELS[s]}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border overflow-x-auto table-scroll">
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
            <tr><th className="p-3">Date</th><th className="p-3">Locataire</th><th className="p-3">Appart.</th><th className="p-3">Titre</th><th className="p-3">Priorité</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-muted/50">
                <td className="p-3 text-sm">{formatDate(t.creeLe)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {t.locataire.photo ? <img src={t.locataire.photo} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{t.locataire.prenom[0]}{t.locataire.nom[0]}</div>}
                    <span className="text-sm">{t.locataire.prenom} {t.locataire.nom}</span>
                  </div>
                </td>
                <td className="p-3">{t.appartement.numero}</td>
                <td className="p-3 font-medium">{t.titre}</td>
                <td className="p-3"><span className={`text-sm font-medium ${PRIORITE_COLORS[t.priorite]}`}>{t.priorite}</span></td>
                <td className="p-3"><Badge variant="outline" className={STATUT_COLORS[t.statut]}>{STATUT_LABELS[t.statut]}</Badge></td>
                <td className="p-3"><Link href={`/maintenance/${t.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link></td>
              </tr>
            ))}
            {tickets.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aucun ticket de maintenance</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
