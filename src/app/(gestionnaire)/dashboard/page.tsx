import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { OccupationPie } from "@/components/charts/occupation-pie";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, evolution, activites] = await Promise.all([
    getDashboardStats(), getRevenusEvolution(6), getDernieresActivites(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Tableau de bord</h1>
        <div className="flex gap-2">
          <Link href="/paiements/nouveau"><Button size="sm">💰 Paiement</Button></Link>
          <Link href="/baux/nouveau"><Button size="sm" variant="outline">📄 Nouveau bail</Button></Link>
          <Link href="/locataires/nouveau"><Button size="sm" variant="outline">👤 Locataire</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Taux d&apos;occupation</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.appartements.tauxOccupation}%</div>
            <p className="text-sm text-gray-500">{stats.appartements.occupes}/{stats.appartements.total} appartements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Revenus du mois</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatFCFA(stats.finances.revenusMois)}</div>
            <p className="text-sm text-gray-500">sur {formatFCFA(stats.finances.revenusAttendus)} attendus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Impayés</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatFCFA(stats.finances.impayesMois)}</div>
            <p className="text-sm text-gray-500">{stats.alertes.impayesLocataires.length} locataire(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Appartements libres</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.appartements.libres}</div>
            <p className="text-sm text-gray-500">disponibles</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Évolution des revenus</CardTitle></CardHeader>
          <CardContent><RevenusChart data={evolution} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Occupation</CardTitle></CardHeader>
          <CardContent><OccupationPie occupes={stats.appartements.occupes} libres={stats.appartements.libres} /></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Baux expirant bientôt</CardTitle></CardHeader>
          <CardContent>
            {stats.alertes.bauxExpirants.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun dans les 30 prochains jours</p>
            ) : (
              <div className="space-y-2">
                {stats.alertes.bauxExpirants.map((b) => (
                  <div key={b.bailId} className="flex justify-between items-center p-2 bg-orange-50 rounded text-sm">
                    <span className="font-medium">{b.locataire} <span className="text-gray-400">({b.appartement})</span></span>
                    <Badge variant="outline" className="text-orange-600">{b.joursRestants}j</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Impayés ce mois</CardTitle></CardHeader>
          <CardContent>
            {stats.alertes.impayesLocataires.length === 0 ? (
              <p className="text-gray-500 text-sm">Tous à jour ✅</p>
            ) : (
              <div className="space-y-2">
                {stats.alertes.impayesLocataires.map((l) => (
                  <div key={l.locataireId} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                    <span className="font-medium">{l.nom}</span>
                    <Badge variant="destructive">{formatFCFA(l.montantDu)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Activité récente</CardTitle></CardHeader>
          <CardContent>
            {activites.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune activité</p>
            ) : (
              <div className="space-y-2">
                {activites.map((a, i) => (
                  <div key={i} className="flex gap-2 text-sm p-1">
                    <span>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{a.message}</p>
                      <p className="text-xs text-gray-400">{formatDate(a.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
