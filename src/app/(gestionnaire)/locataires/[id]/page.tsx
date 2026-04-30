import { getLocataire } from "@/actions/locataires";
import { getSituationLocataire } from "@/actions/situation";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArchiverButton } from "./archiver-button";
import { CreerCompteButton } from "./creer-compte";
import { GererCompteButton } from "./gerer-compte";
import { SupprimerLocataireButton } from "./supprimer-button";
import { ProfilTabs } from "./profil-tabs";

export default async function LocataireDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loc = await getLocataire(id);
  if (!loc) notFound();
  const situation = await getSituationLocataire(id);

  const bailActif = loc.baux.find((b) => b.statut === "ACTIF");

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/locataires" className="text-muted-foreground hover:text-foreground text-sm">← Retour</Link>
        <div className="flex items-center gap-4 flex-1">
          {loc.photo ? (
            <img src={loc.photo} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-sky-200" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">{loc.prenom[0]}{loc.nom[0]}</div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{loc.prenom} {loc.nom}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={loc.statut === "ACTIF" ? "text-emerald-600 border-emerald-300" : "text-muted-foreground"}>{loc.statut === "ACTIF" ? "Actif" : "Archivé"}</Badge>
              {bailActif && <span className="text-sm text-muted-foreground">📍 {bailActif.appartement.numero}</span>}
              <span className="text-sm text-muted-foreground">📞 {loc.telephone}</span>
              {loc.email && <span className="text-sm text-muted-foreground">✉️ {loc.email}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Entré le {formatDate(loc.dateEntree)}{loc.dateSortie ? ` — Sorti le ${formatDate(loc.dateSortie)}` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {loc.statut === "ACTIF" && !loc.utilisateur && <CreerCompteButton locataireId={loc.id} email={loc.email} />}
          {loc.utilisateur && <GererCompteButton utilisateurId={loc.utilisateur.id} email={loc.utilisateur.email} />}
          <Link href={`/locataires/${loc.id}/documents`}><Button variant="outline" size="sm">📁 Documents</Button></Link>
          {loc.statut === "ACTIF" && <ArchiverButton locataireId={loc.id} />}
          <SupprimerLocataireButton locataireId={loc.id} nom={`${loc.prenom} ${loc.nom}`} />
        </div>
      </div>

      {/* Quick summary bar */}
      {situation && (
        <div className="flex gap-4 p-3 bg-muted/30 rounded-lg text-sm flex-wrap">
          <span>🏠 Loyer : <strong>{formatFCFA(situation.bail?.montantLoyer || 0)}</strong></span>
          <span>⚡ Charges : <strong>{formatFCFA(situation.bail?.totalCharges || 0)}</strong></span>
          <span>📅 Paiement le : <strong>{situation.bail?.jourLimitePaiement || "—"} du mois</strong></span>
          <span className={situation.totalDu > 0 ? "text-red-600" : "text-emerald-600"}>💰 Dû : <strong>{formatFCFA(situation.totalDu)}</strong></span>
          <span>📄 {loc.baux.length} bail(s)</span>
          <span>💳 {loc.baux.reduce((s, b) => s + b.paiements.length, 0)} paiement(s)</span>
        </div>
      )}

      {/* Tabs */}
      <ProfilTabs locataire={JSON.parse(JSON.stringify(loc))} situation={situation ? JSON.parse(JSON.stringify(situation)) : null} />
    </div>
  );
}
