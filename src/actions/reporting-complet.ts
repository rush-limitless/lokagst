"use server";

import { prisma } from "@/lib/prisma";

export async function getReportingComplet() {
  const now = new Date();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: { include: { immeuble: true } }, paiements: { orderBy: { moisConcerne: "asc" } }, penalites: true },
    orderBy: [{ appartement: { immeuble: { nom: "asc" } } }, { appartement: { etage: "asc" } }, { appartement: { numero: "asc" } }],
  });

  // Get ALL paiements for each locataire+appartement (including terminated baux)
  const allBaux = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU", "TERMINE", "RESILIE"] } },
    include: { paiements: true },
  });

  // Map: locataireId+appartementId → total all paiements across all baux
  const allPaiementsMap = new Map<string, number>();
  for (const b of allBaux) {
    const key = `${b.locataireId}_${b.appartementId}`;
    const total = b.paiements.reduce((s, p) => s + p.montant, 0);
    allPaiementsMap.set(key, (allPaiementsMap.get(key) || 0) + total);
  }

  const bauxAnciens = await prisma.bail.findMany({
    where: { statut: { in: ["RESILIE", "TERMINE", "EXPIRE"] } },
    include: { locataire: true, appartement: { include: { immeuble: true } }, paiements: true },
    orderBy: [{ appartement: { immeuble: { nom: "asc" } } }, { appartement: { etage: "asc" } }],
  });

  // Suivi des paiements
  const suiviPaiements = bauxActifs.map((b) => {
    const loyerCharges = b.totalMensuel || (b.montantLoyer + b.totalCharges);
    const joursHabitation = Math.ceil((now.getTime() - new Date(b.dateDebut).getTime()) / 86400000);
    const moisHabitation = joursHabitation / 30.5;
    // Mois échus selon la périodicité
    // Mois échus depuis le PREMIER bail (pas juste le bail actif)
    const allBauxForLoc = allBaux.filter((ab) => ab.locataireId === b.locataireId && ab.appartementId === b.appartementId);
    const premierDebut = allBauxForLoc.reduce((min, ab) => ab.dateDebut < min ? ab.dateDebut : min, b.dateDebut);
    const debut = new Date(premierDebut);
    const moisDepuisDebut = (now.getFullYear() - debut.getFullYear()) * 12 + (now.getMonth() - debut.getMonth()) + 1;
    // Attendu = nombre total de mois depuis le premier bail × loyer+charges mensuel
    const attendu = loyerCharges * moisDepuisDebut;
    // Réglé = ALL paiements across all baux for this locataire+appartement
    const allKey = `${b.locataireId}_${b.appartementId}`;
    const regle = allPaiementsMap.get(allKey) || 0;
    const regleLoyerCharges = regle; // Already includes all baux
    const difference = regleLoyerCharges - attendu;
    const joursRestants = Math.ceil((new Date(b.dateFin).getTime() - now.getTime()) / 86400000);
    const moisRestants = joursRestants / 30.5;
    const penalitesTotal = b.penalites.reduce((s, p) => s + p.montant, 0);

    // Prochaine échéance

    return {
      immeuble: b.appartement.immeuble?.nom || "Sans immeuble",
      etage: b.appartement.etage,
      logement: b.appartement.numero,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      loyerMensuel: b.montantLoyer,
      chargesMensuelles: b.totalCharges,
      dateEntree: new Date(b.dateDebut),
      dateSortie: b.dateFin ? new Date(b.dateFin) : null,
      joursHabitation,
      moisHabitation: Math.round(moisHabitation * 10) / 10,
      moisHabitationArrondi: moisDepuisDebut,
      attendu,
      regle,
      difference,
      joursRestants,
      moisRestants: Math.round(moisRestants * 10) / 10,
      caution: b.montantCaution,
      cautionPayee: b.cautionPayee,
      totalPercu: regle + (b.cautionPayee ? b.montantCaution : 0),
      totalEncaisse: regle + (b.cautionPayee ? b.montantCaution : 0),
      penalites: penalitesTotal,
      periodicite: b.periodicite,
      statut: b.statut,
    };
  });

  // Synthèse par mois
  const moisDebut = new Date(2025, 0, 1);
  const moisFin = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const moisList: Date[] = [];
  const d = new Date(moisDebut);
  while (d < moisFin) { moisList.push(new Date(d)); d.setMonth(d.getMonth() + 1); }

  const synthese = bauxActifs.map((b) => {
    const paiementsParMois: Record<string, number> = {};
    b.paiements.forEach((p) => {
      const key = `${new Date(p.moisConcerne).getFullYear()}-${String(new Date(p.moisConcerne).getMonth() + 1).padStart(2, "0")}`;
      paiementsParMois[key] = (paiementsParMois[key] || 0) + p.montant;
    });

    return {
      immeuble: b.appartement.immeuble?.nom || "Sans immeuble",
      etage: b.appartement.etage,
      logement: b.appartement.numero,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      loyerMensuel: b.montantLoyer,
      chargesMensuelles: b.totalCharges,
      caution: b.montantCaution,
      dateEntree: new Date(b.dateDebut),
      paiementsParMois,
    };
  });

  // Anciens locataires
  const anciens = bauxAnciens.map((b) => {
    const regle = b.paiements.reduce((s, p) => s + p.montant, 0);
    const joursHab = Math.ceil((new Date(b.dateFin).getTime() - new Date(b.dateDebut).getTime()) / 86400000);
    const moisHab = joursHab / 30.5;
    const moisHabArrondi = Math.ceil(moisHab);
    const attendu = (b.montantLoyer + b.totalCharges) * moisHabArrondi;

    return {
      logement: b.appartement.numero,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      loyerMensuel: b.montantLoyer,
      chargesMensuelles: b.totalCharges,
      dateEntree: new Date(b.dateDebut),
      dateSortie: new Date(b.dateFin),
      joursHabitation: joursHab,
      moisHabitation: Math.round(moisHab * 10) / 10,
      attendu,
      regle,
      difference: regle - attendu,
      caution: b.montantCaution,
      totalPercu: regle + b.montantCaution,
    };
  });

  // Etat contrats
  const etatContrats = bauxActifs.map((b) => ({
    immeuble: b.appartement.immeuble?.nom || "Sans immeuble",
      etage: b.appartement.etage,
    logement: b.appartement.numero,
    locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
    loyerMensuel: b.montantLoyer,
    chargesMensuelles: b.totalCharges,
    caution: b.montantCaution,
    dateEntree: new Date(b.dateDebut),
    periodicite: b.periodicite,
    statut: b.statut,
  }));

  return { suiviPaiements, synthese, moisList, anciens, etatContrats };
}
