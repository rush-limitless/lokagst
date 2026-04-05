import { getAppartement } from "@/actions/appartements";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModifierAppartForm } from "./modifier-form";
import { SupprimerAppartButton } from "./supprimer-button";

export default async function AppartementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appart = await getAppartement(id);
  if (!appart) notFound();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/appartements" className="text-muted-foreground hover:text-foreground text-sm">← Retour</Link>
          <h1 className="text-xl font-bold text-foreground">Appartement {appart.numero}</h1>
          <StatusBadge status={appart.statut === "LIBRE" ? "libre" : "occupe"} label={appart.statut === "LIBRE" ? "Libre" : "Occupé"} />
        </div>
        <SupprimerAppartButton id={appart.id} hasActiveBail={appart.baux.some(b => b.statut === "ACTIF")} />
      </div>

      <ModifierAppartForm appart={appart} />

      <Card>
        <CardHeader><CardTitle className="text-sm">Historique des baux</CardTitle></CardHeader>
        <CardContent>
          {appart.baux.length === 0 ? (
            <div className="text-center py-6"><div className="text-3xl mb-2">📭</div><p className="text-muted-foreground text-sm">Aucun bail</p></div>
          ) : (
            <div className="space-y-2">
              {appart.baux.map((b) => (
                <Link key={b.id} href={`/baux/${b.id}`} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <span className="font-medium text-foreground">{b.locataire.prenom} {b.locataire.nom}</span>
                    <span className="text-muted-foreground text-sm ml-2">{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{formatFCFA(b.montantLoyer)}/mois</span>
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
