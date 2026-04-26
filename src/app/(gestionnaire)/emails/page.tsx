import { getEmailLogs } from "@/actions/emails";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EnvoyerRappelsButton } from "./rappel-button";

const TYPE_LABELS: Record<string, string> = {
  RAPPEL_PAIEMENT: "Rappel",
  RECU_PAIEMENT: "Reçu",
  EXPIRATION_BAIL: "Expiration bail",
};

const TYPE_COLORS: Record<string, string> = {
  RAPPEL_PAIEMENT: "text-orange-600 border-orange-600",
  RECU_PAIEMENT: "text-green-600 border-green-600",
  EXPIRATION_BAIL: "text-red-600 border-red-600",
};

export default async function EmailsPage() {
  const logs = await getEmailLogs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Emails envoyés</h1>
        <EnvoyerRappelsButton />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{logs.length}</div>
            <p className="text-sm text-muted-foreground">Total envoyés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{logs.filter((l) => l.type === "RAPPEL_PAIEMENT").length}</div>
            <p className="text-sm text-muted-foreground">Rappels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{logs.filter((l) => l.type === "RECU_PAIEMENT").length}</div>
            <p className="text-sm text-muted-foreground">Reçus</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border overflow-x-auto table-scroll">
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Locataire</th>
              <th className="p-3">Destinataire</th>
              <th className="p-3">Type</th>
              <th className="p-3">Sujet</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun email envoyé</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50">
                  <td className="p-3 text-sm">{formatDate(log.envoyeLe)}</td>
                  <td className="p-3 font-medium">{log.locataire.prenom} {log.locataire.nom}</td>
                  <td className="p-3 text-sm text-muted-foreground">{log.destinataire}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={TYPE_COLORS[log.type]}>{TYPE_LABELS[log.type]}</Badge>
                  </td>
                  <td className="p-3 text-sm">{log.sujet}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
