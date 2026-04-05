import { getMaintenance } from "@/actions/maintenance";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { UpdateMaintenanceForm } from "./update-form";

const STATUT_LABELS: Record<string, string> = { SIGNALE: "Signalé", EN_COURS: "En cours", RESOLU: "Résolu" };
const STATUT_COLORS: Record<string, string> = { SIGNALE: "text-orange-600", EN_COURS: "text-blue-600", RESOLU: "text-green-600" };

export default async function MaintenanceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getMaintenance(id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-950">{ticket.titre}</h1>
        <Badge variant="outline" className={STATUT_COLORS[ticket.statut]}>{STATUT_LABELS[ticket.statut]}</Badge>
        <span className={`text-sm font-medium ${ticket.priorite === "URGENTE" ? "text-red-600" : ticket.priorite === "NORMALE" ? "text-blue-600" : "text-gray-500"}`}>{ticket.priorite}</span>
      </div>

      <Card>
        <CardHeader><CardTitle>Détails</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-gray-500">Locataire</span><p className="font-medium">{ticket.locataire.prenom} {ticket.locataire.nom}</p></div>
            <div><span className="text-gray-500">Appartement</span><p className="font-medium">{ticket.appartement.numero}</p></div>
            <div><span className="text-gray-500">Signalé le</span><p className="font-medium">{formatDate(ticket.creeLe)}</p></div>
            {ticket.technicien && <div><span className="text-gray-500">Technicien</span><p className="font-medium">{ticket.technicien}</p></div>}
          </div>
          <div><span className="text-gray-500">Description</span><p className="mt-1 whitespace-pre-wrap">{ticket.description}</p></div>
          {ticket.commentaire && <div><span className="text-gray-500">Commentaire gestionnaire</span><p className="mt-1 whitespace-pre-wrap">{ticket.commentaire}</p></div>}
        </CardContent>
      </Card>

      {ticket.photos.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {ticket.photos.map((p, i) => <img key={i} src={p} alt="" className="w-32 h-32 rounded-lg object-cover border" />)}
            </div>
          </CardContent>
        </Card>
      )}

      {ticket.statut !== "RESOLU" && (
        <Card>
          <CardHeader><CardTitle>Mettre à jour</CardTitle></CardHeader>
          <CardContent>
            <UpdateMaintenanceForm id={ticket.id} currentStatut={ticket.statut} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
