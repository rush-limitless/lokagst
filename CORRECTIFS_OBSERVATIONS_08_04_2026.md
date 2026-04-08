# Récapitulatif des correctifs — Observations IMMOGEST au 08/04/2026

Date d'application : 08/04/2026

---

## 1. TABLEAU DE BORD — Impayés (✅ Corrigé)

**Observation** : Pas d'indication sur la période concernée des impayés.
**Desiderata** : Préciser la période + afficher total loyers impayés, charges impayées, cautions impayées.

**Correctifs appliqués** :
- La carte "Impayés" affiche maintenant le mois en cours (ex: "Impayés — avril 2026")
- Sous le montant total, détail visible : `Loyers: X FCFA · Charges: X FCFA · Cautions: X FCFA`
- Fichiers modifiés : `src/actions/dashboard.ts`, `src/app/(gestionnaire)/dashboard/page.tsx`

---

## 2. TABLEAU DE BORD — Revenus (✅ Corrigé)

**Observation** : Pas d'indication sur la période concernée des revenus.
**Desiderata** : Préciser la période + afficher total loyers versés, charges versées, cautions versées.

**Correctifs appliqués** :
- La carte "Revenus" affiche maintenant le mois en cours (ex: "Revenus — avril 2026")
- Sous le montant total, détail visible : `Loyers: X FCFA · Charges: X FCFA · Cautions: X FCFA`
- Fichiers modifiés : `src/actions/dashboard.ts`, `src/app/(gestionnaire)/dashboard/page.tsx`

---

## 3. TABLEAU DE BORD — Évolution des revenus (✅ Corrigé)

**Observation** : Les revenus attendus ne correspondent pas aux statistiques (valeur fixe de 50 000 FCFA par bail).
**Desiderata** : Faire correspondre les informations avec les données réelles.

**Correctifs appliqués** :
- Le calcul des revenus attendus utilise maintenant le `totalMensuel` réel de chaque bail (loyer + charges) au lieu d'une approximation fixe de 50 000 FCFA
- Fichier modifié : `src/actions/dashboard.ts` (fonction `getRevenusEvolution`)

---

## 4. APPARTEMENTS — Types de logement (✅ Corrigé)

**Observation** : T2, T3, T4 sont imprécis. Seul "Studio" est clair.
**Desiderata** : Renommer les types.

**Correctifs appliqués** :
- T2 → **Chambre**
- T3 → **Appartement non meublé**
- T4 → **Appartement meublé**
- Ajout du type **Villa**
- Ajout de l'étage **5ème** (pour l'appartement meublé)
- Migration Prisma appliquée : `20260408170000_boss_observations_08_04_2026`
- Fichiers modifiés : `prisma/schema.prisma`, `src/lib/validations.ts`, `src/lib/utils.ts`, `src/app/(gestionnaire)/appartements/nouveau/page.tsx`, `src/app/(gestionnaire)/appartements/[id]/modifier-form.tsx`, `prisma/seed.ts`

---

## 5. APPARTEMENTS — Charges (✅ Corrigé)

**Observation** : Pas d'indication des charges liées à chaque appartement.
**Desiderata** : Introduire "charges" à côté de "loyers" sur les cartes.

**Correctifs appliqués** :
- Les cartes d'appartements affichent maintenant les charges du bail actif sous le loyer (ex: "Charges : 7 500 FCFA")
- Le type de logement est affiché en clair (ex: "Appartement non meublé" au lieu de "T3")
- Fichier modifié : `src/app/(gestionnaire)/appartements/page.tsx`

---

## 6. APPARTEMENTS — Historique des baux (✅ Déjà fonctionnel)

**Observation** : Historique des baux absent.
**Desiderata** : Utiliser les anciens locataires pour remplir l'historique.

**État** : L'historique des baux est déjà visible sur la page détail de chaque appartement (`/appartements/[id]`). Il affiche tous les baux (actifs, terminés, résiliés) avec le nom du locataire, les dates et le loyer. Les anciens locataires du seed sont créés avec des baux archivés qui apparaissent dans cet historique.

---

## 7. CONTRATS — Champs modifiables (✅ Corrigé)

**Observation** : Les champs du contrat semblent non modifiables.
**Desiderata** : Rendre modifiables : Début, Fin, Loyers, Charges, Caution, Renouvellement automatique.

**Correctifs appliqués** :
- Ajout d'un bouton "✏️ Modifier le contrat" sur la page détail du bail
- Formulaire d'édition inline permettant de modifier : Date début, Date fin, Loyer, Caution, Charges locatives (ajout/suppression/modification), Renouvellement auto
- Le total mensuel est recalculé automatiquement
- Nouvelle action serveur `modifierBail` créée
- Fichiers créés : `src/app/(gestionnaire)/baux/[id]/modifier-bail-form.tsx`
- Fichiers modifiés : `src/actions/baux.ts`, `src/app/(gestionnaire)/baux/[id]/page.tsx`

---

## 8. PAIEMENTS — Ventilation par rubrique + Modification/Suppression (✅ Corrigé)

**Observation** : Les paiements doivent être enregistrés mois après mois. Impossible de ventiler un paiement annuel. Impossible de supprimer un paiement.
**Desiderata** : Permettre la ventilation par mois et par rubrique. Rendre les paiements modifiables ou supprimables.

**Correctifs appliqués** :

### Ventilation
- Le formulaire de nouveau paiement permet maintenant de préciser :
  - **Nombre de mois couverts** (1 à 12) — l'application ventile automatiquement
  - **Montant loyer** (pré-rempli selon le bail × nb mois)
  - **Montant charges** (pré-rempli selon le bail × nb mois)
  - **Montant caution** (champ libre)
  - **Montant autres** (champ libre avec description)
- Le total est calculé automatiquement
- Exemple : un paiement annuel de 3 960 000 FCFA peut être saisi avec 12 mois, et l'application crée 12 entrées mensuelles

### Modification/Suppression
- Ajout d'un bouton "Suppr." sur chaque ligne de paiement dans le tableau
- Nouvelle action serveur `supprimerPaiement` et `modifierPaiement`
- Le tableau affiche maintenant les colonnes détaillées : Loyer, Charges, Caution, Total

### Schéma
- Ajout des champs `montantCaution`, `montantAutres`, `notesAutres` au modèle Paiement
- Suppression de la contrainte unique `bailId + moisConcerne` (pour permettre les ventilations)

- Fichiers modifiés : `prisma/schema.prisma`, `src/lib/validations.ts`, `src/actions/paiements.ts`, `src/app/(gestionnaire)/paiements/nouveau/page.tsx`, `src/app/(gestionnaire)/paiements/page.tsx`
- Fichiers créés : `src/app/(gestionnaire)/paiements/supprimer-paiement-button.tsx`

---

## 9. REPORTING — Valeurs non entières (✅ Corrigé)

**Observation** : Présence de valeurs non entières dans le tableau de suivi Excel.
**Desiderata** : Privilégier les valeurs entières pour le calcul des sommes dues et de la rentabilité.

**Correctifs appliqués** :
- Le calcul du montant "attendu" utilise maintenant `Math.ceil(moisHabitation)` (arrondi supérieur au mois entier) au lieu de `moisHabitation` décimal
- Résultat : toutes les valeurs financières dans l'Excel sont des entiers
- Fichier modifié : `src/actions/reporting-complet.ts`

---

## Migration base de données

Migration appliquée : `20260408170000_boss_observations_08_04_2026`

Changements :
- Enum `Etage` : ajout de `CINQUIEME`
- Enum `TypeAppartement` : `T2`→`CHAMBRE`, `T3`→`APPARTEMENT`, `T4`→`APPARTEMENT_MEUBLE`, ajout `VILLA`
- Table `paiements` : ajout colonnes `montantCaution`, `montantAutres`, `notesAutres`
- Suppression contrainte unique `paiements_bailId_moisConcerne_key`

---

## Fichiers modifiés (résumé)

| Fichier | Modification |
|---------|-------------|
| `prisma/schema.prisma` | Nouveaux types, étage 5, champs paiement |
| `prisma/seed.ts` | Mise à jour types appartements |
| `src/lib/utils.ts` | Labels types + étage 5 |
| `src/lib/validations.ts` | Schémas mis à jour |
| `src/actions/dashboard.ts` | Détail revenus/impayés + fix revenus attendus |
| `src/actions/paiements.ts` | Ventilation multi-mois + modif/suppression |
| `src/actions/baux.ts` | Action modifierBail |
| `src/actions/reporting-complet.ts` | Valeurs entières |
| `src/actions/rapports.ts` | Calcul entier |
| `src/actions/portail-paiement.ts` | Fix contrainte unique |
| `src/app/(gestionnaire)/dashboard/page.tsx` | Affichage période + détail |
| `src/app/(gestionnaire)/appartements/page.tsx` | Charges + type lisible |
| `src/app/(gestionnaire)/appartements/nouveau/page.tsx` | Nouveaux types |
| `src/app/(gestionnaire)/appartements/[id]/modifier-form.tsx` | Nouveaux types |
| `src/app/(gestionnaire)/paiements/page.tsx` | Colonnes détaillées + suppression |
| `src/app/(gestionnaire)/paiements/nouveau/page.tsx` | Ventilation complète |
| `src/app/(gestionnaire)/baux/[id]/page.tsx` | Bouton modifier contrat |
| `src/app/(gestionnaire)/reporting/page.tsx` | Étage 5 |
| **Nouveaux fichiers** | |
| `src/app/(gestionnaire)/baux/[id]/modifier-bail-form.tsx` | Formulaire édition bail |
| `src/app/(gestionnaire)/paiements/supprimer-paiement-button.tsx` | Bouton suppression paiement |
