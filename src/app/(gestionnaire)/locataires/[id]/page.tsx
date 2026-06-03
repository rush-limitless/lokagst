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
import { StarRating } from "@/components/star-rating";
import { calculerScoreLocataire } from "@/lib/score-locataire";
import { FileText } from "lucide-react";

export default async function LocataireDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loc = await getLocataire(id);
  if (!loc) notFound();
  const situation = await getSituationLocataire(id);

  const bailActif = loc.baux.find((b) => b.statut === "ACTIF");
  const totalPaiements = loc.baux.reduce((s, b) => s + b.paiements.length, 0);
  const totalMoisBaux = loc.baux.reduce((s, b) => {
    const debut = new Date(b.dateDebut);
    const fin = b.statut === "ACTIF" ? new Date() : new Date(b.dateFin);
    return s + Math.max(0, Math.ceil((fin.getTime() - debut.getTime()) / (30 * 86400000)));
  }, 0);
  const anciennete = loc.baux.length > 0 ? Math.ceil((Date.now() - new Date(loc.dateEntree).getTime()) / (30 * 86400000)) : 0;
  const nbPenalites = loc.baux.reduce((s, b) => s + (b.penalites?.length || 0), 0);
  const score = calculerScoreLocataire({ moisTotal: totalMoisBaux, moisPayes: totalPaiements, ancienneteMois: anciennete, nbPenalites });

  // Derniers paiements (tous baux confondus, triés)
  const derniersPaiements = loc.baux.flatMap(b => b.paiements.map(p => ({ ...p, appartement: b.appartement.numero }))).sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime()).slice(0, 10);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          {loc.photo ? (
            <img src={loc.photo} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-sky-200" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">{loc.prenom[0]}{loc.nom[0]}</div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{loc.prenom} {loc.nom}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <Badge variant="outline" className={loc.statut === "ACTIF" ? "text-emerald-600 border-emerald-300" : "text-muted-foreground"}>{loc.statut === "ACTIF" ? "Actif" : "Archivé"}</Badge>
              {bailActif && <span className="text-sm text-muted-foreground">{bailActif.appartement.numero}</span>}
              <StarRating etoiles={score.etoiles} label={score.label} />
            </div>
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
              {loc.telephone && <span>📞 {loc.telephone}</span>}
              {loc.email && <span>✉️ {loc.email}</span>}
              <span>Depuis {formatDate(loc.dateEntree)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {loc.statut === "ACTIF" && bailActif && <Link href={`/paiements/nouveau?bailId=${bailActif.id}`}><Button size="sm">💰 Paiement</Button></Link>}
          {loc.statut === "ACTIF" && !loc.utilisateur && <CreerCompteButton locataireId={loc.id} email={loc.email} />}
          {loc.utilisateur && <GererCompteButton utilisateurId={loc.utilisateur.id} email={loc.utilisateur.email} />}
          <Link href={`/locataires/${loc.id}/documents`}><Button variant="outline" size="sm">Documents</Button></Link>
          {loc.statut === "ACTIF" && <ArchiverButton locataireId={loc.id} />}
          <SupprimerLocataireButton locataireId={loc.id} nom={`${loc.prenom} ${loc.nom}`} />
        </div>
      </div>

      {/* Score + Solde */}
      {situation && (() => {
        const moisRetard = situation.loyer.moisImpayes;
        const isOk = moisRetard === 0;
        return (
          <div className={`rounded-xl p-5 border ${isOk ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{situation.totalDu > 0 ? "Total dû" : "Statut"}</p>
                <p className={`text-3xl font-bold mt-1 ${isOk ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  {isOk ? "À jour ✓" : formatFCFA(situation.totalDu)}
                </p>
                {!isOk && <p className="text-xs text-red-600 mt-1">{moisRetard} mois de retard · Loyer {formatFCFA(situation.loyer.montantDu)} + Charges {formatFCFA(situation.charges.montantDu)}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{formatFCFA(situation.bail?.montantLoyer || 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Loyer</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{formatFCFA(situation.bail?.totalCharges || 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Charges</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{situation.caution.payee ? "✅" : "❌"}</p>
                  <p className="text-[10px] text-muted-foreground">Caution {formatFCFA(situation.caution.montant)}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Historique paiements récents */}
      {derniersPaiements.length > 0 && (
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Historique des paiements</p>
            <span className="text-[10px] text-muted-foreground">{totalPaiements} au total</span>
          </div>
          <div className="space-y-2">
            {derniersPaiements.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <span className="text-emerald-600 text-xs font-bold">{new Date(p.datePaiement).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatFCFA(p.montant)}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(p.datePaiement).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} · {p.modePaiement === "VIREMENT_BANCAIRE" ? "Virement" : p.modePaiement === "MOBILE_MONEY" ? "Mobile Money" : "Espèces"}</p>
                  </div>
                </div>
                <a href={`/api/quittance-pdf?id=${p.id}`} target="_blank" className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <FileText className="size-3" /> Quittance
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs existants */}
      <ProfilTabs locataire={JSON.parse(JSON.stringify(loc))} situation={situation ? JSON.parse(JSON.stringify(situation)) : null} />
    </div>
  );
}
