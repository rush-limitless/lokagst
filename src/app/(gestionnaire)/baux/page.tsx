import { getBaux } from "@/actions/baux";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BauxPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const baux = await getBaux(statut ? { statut } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Contrats / Baux</h1>
        <Link href="/baux/nouveau"><Button>+ Nouveau bail</Button></Link>
      </div>
      <div className="flex gap-2">
        <Link href="/baux" className={`text-sm px-3 py-1 rounded-full border ${!statut ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>Tous</Link>
        <Link href="/baux?statut=ACTIF" className={`text-sm px-3 py-1 rounded-full border ${statut === "ACTIF" ? "bg-green-100 text-green-700" : "text-gray-500"}`}>Actifs</Link>
        <Link href="/baux?statut=SUSPENDU" className={`text-sm px-3 py-1 rounded-full border ${statut === "SUSPENDU" ? "bg-orange-100 text-orange-700" : "text-gray-500"}`}>Suspendus</Link>
        <Link href="/baux?statut=EXPIRE" className={`text-sm px-3 py-1 rounded-full border ${statut === "EXPIRE" ? "bg-red-100 text-red-700" : "text-gray-500"}`}>Expirés</Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr><th className="p-3">Locataire</th><th className="p-3">Appart.</th><th className="p-3">Début</th><th className="p-3">Fin</th><th className="p-3">Loyer</th><th className="p-3">Total/mois</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {baux.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {b.locataire.photo ? <img src={b.locataire.photo} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{b.locataire.prenom[0]}{b.locataire.nom[0]}</div>}
                    <span className="font-medium text-sm">{b.locataire.prenom} {b.locataire.nom}</span>
                  </div>
                </td>
                <td className="p-3">{b.appartement.numero}</td>
                <td className="p-3 text-sm">{formatDate(b.dateDebut)}</td>
                <td className="p-3 text-sm">{formatDate(b.dateFin)}</td>
                <td className="p-3 text-sm">{formatFCFA(b.montantLoyer)}</td>
                <td className="p-3 text-sm font-medium">{formatFCFA(b.totalMensuel)}</td>
                <td className="p-3"><Badge variant={b.statut === "ACTIF" ? "outline" : "destructive"} className={b.statut === "ACTIF" ? "text-green-600 border-green-600" : b.statut === "SUSPENDU" ? "text-orange-600 border-orange-600" : ""}>{STATUT_BAIL_LABELS[b.statut]}</Badge></td>
                <td className="p-3"><Link href={`/baux/${b.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link></td>
              </tr>
            ))}
            {baux.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-500">Aucun bail</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
