import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenusChart } from "@/components/charts/revenus-chart";

export default async function DashboardPage() {
  const [stats, evolution] = await Promise.all([getDashboardStats(), getRevenusEvolution(6)]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Tableau de bord</h1>

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
            <p className="text-sm text-gray-500">disponibles à la location</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Évolution des revenus (6 mois)</CardTitle></CardHeader>
        <CardContent>
          <RevenusChart data={evolution} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Baux expirant bientôt</CardTitle></CardHeader>
          <CardContent>
            {stats.alertes.bauxExpirants.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun bail expirant dans les 30 prochains jours</p>
            ) : (
              <div className="space-y-2">
                {stats.alertes.bauxExpirants.map((b) => (
                  <div key={b.bailId} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <div>
                      <span className="font-medium">{b.locataire}</span>
                      <span className="text-gray-500 text-sm ml-2">({b.appartement})</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600">{b.joursRestants}j restants</Badge>
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
              <p className="text-gray-500 text-sm">Tous les loyers sont à jour</p>
            ) : (
              <div className="space-y-2">
                {stats.alertes.impayesLocataires.map((l) => (
                  <div key={l.locataireId} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="font-medium">{l.nom}</span>
                    <Badge variant="destructive">{formatFCFA(l.montantDu)}</Badge>
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
