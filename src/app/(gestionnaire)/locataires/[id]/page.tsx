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
          {loc.statut === "ACTIF" && bailActif && <Link href={`/paiements/nouveau?bailId=${bailActif.id}`}><Button size="sm" className="gap-1.5">Paiement</Button></Link>}
          {loc.statut === "ACTIF" && !loc.utilisateur && <CreerCompteButton locataireId={loc.id} email={loc.email} />}
          {loc.utilisateur && <GererCompteButton utilisateurId={loc.utilisateur.id} email={loc.utilisateur.email} />}
          <Link href={`/locataires/${loc.id}/documents`}><Button variant="outline" size="sm">Documents</Button></Link>
          {loc.statut === "ACTIF" && <ArchiverButton locataireId={loc.id} />}
          <SupprimerLocataireButton locataireId={loc.id} nom={`${loc.prenom} ${loc.nom}`} />
        </div>
      </div>

      {/* Quick summary bar */}
      {situation && (() => {
        const moisRetard = situation.loyer.moisImpayes;
        const score = moisRetard === 0 ? "excellent" : moisRetard <= 1 ? "attention" : moisRetard <= 3 ? "risque" : "critique";
        const gradients = { excellent: "from-emerald-500 to-teal-600", attention: "from-yellow-500 to-amber-600", risque: "from-orange-500 to-red-500", critique: "from-red-600 to-rose-700" };
        const scoreLabels = { excellent: "À jour", attention: "1 mois de retard", risque: `${moisRetard} mois`, critique: `${moisRetard} mois` };
        return (
          <div className={`bg-gradient-to-r ${gradients[score]} rounded-xl p-5 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-white/70 text-xs">{situation.totalDu > 0 ? "Solde dû" : "Avance"}</p>
                <p className="text-3xl font-bold mt-1">{formatFCFA(Math.abs(situation.totalDu))}</p>
                <div className="flex gap-3 mt-2 text-xs text-white/80">
                  <span>Loyer: {formatFCFA(situation.bail?.montantLoyer || 0)}</span>
                  <span>Charges: {formatFCFA(situation.bail?.totalCharges || 0)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">{scoreLabels[score]}</span>
                <div className="flex gap-2 text-[10px] text-white/60">
                  <span>{loc.baux.length} bail(s)</span>
                  <span>💳 {loc.baux.reduce((s, b) => s + b.paiements.length, 0)} paiement(s)</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      <ProfilTabs locataire={JSON.parse(JSON.stringify(loc))} situation={situation ? JSON.parse(JSON.stringify(situation)) : null} />
    </div>
  );
}
