import { getMesTickets } from "@/actions/portail-maintenance";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SignalerForm } from "./signaler-form";

const STATUT_LABELS: Record<string, string> = { SIGNALE: "Signalé", EN_COURS: "En cours", RESOLU: "Résolu" };
const STATUT_COLORS: Record<string, string> = { SIGNALE: "text-orange-600 border-orange-600", EN_COURS: "text-blue-600 border-blue-600", RESOLU: "text-green-600 border-green-600" };

export default async function MaMaintenancePage() {
  const tickets = await getMesTickets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>

      <SignalerForm />

      {tickets.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-3">Mes signalements</h2>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{t.titre}</span>
                  <Badge variant="outline" className={STATUT_COLORS[t.statut]}>{STATUT_LABELS[t.statut]}</Badge>
                </div>
                <p className="text-sm text-foreground">{t.description}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>Appart. {t.appartement.numero}</span>
                  <span>{formatDate(t.creeLe)}</span>
                </div>
                {t.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">{t.photos.map((p, i) => <img key={i} src={p} alt="" className="w-14 h-14 rounded object-cover" />)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
