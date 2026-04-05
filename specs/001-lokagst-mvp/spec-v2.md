# LokaGest v2 — Spécifications complètes

**Date** : 5 avril 2026
**Statut** : Validé pour développement
**Contexte** : Retours du directeur FINSTAR après test de la v1. L'objectif est qu'à partir des données initiales et des termes particuliers de chaque contrat de bail, la gestion des locataires soit **entièrement prise en charge** par l'application.

---

## 1. GESTION DES BAUX — Termes complets du contrat

### 1.1 Données du bail

Chaque bail doit enregistrer **tous les termes du contrat** :

**Informations de base :**
- Locataire (avec photo d'identité)
- Appartement assigné
- Date de début du bail
- Durée du bail (en mois)
- Date de fin (calculée automatiquement)

**Conditions financières :**
- Montant du loyer mensuel (FCFA)
- Montant de la caution (FCFA)
- Charges locatives mensuelles (FCFA) — eau, électricité parties communes, gardiennage, entretien, ordures, etc.
- Total mensuel dû = loyer + charges locatives

**Modalités de paiement :**
- Jour limite de paiement chaque mois (ex : le 5 du mois, le 10, etc.)
- Modes de paiement acceptés (Espèces, Mobile Money, Virement)
- Pénalité de retard : montant ou pourcentage appliqué après le jour limite (ex : 5% du loyer par semaine de retard, ou montant fixe)
- Délai de grâce avant pénalité (en jours, ex : 5 jours après le jour limite)

**Conditions de renouvellement :**
- Renouvellement automatique : Oui/Non
- Si oui : durée du renouvellement (en mois)
- Préavis de non-renouvellement (en jours avant la fin du bail, ex : 30 jours)
- Conditions de renouvellement : augmentation de loyer possible (pourcentage ou montant)

**Conditions de résiliation :**
- Préavis de résiliation par le locataire (en jours)
- Préavis de résiliation par le propriétaire (en jours)
- Motifs de suspension automatique (nombre de mois d'impayés, ex : 3 mois)

**Clauses particulières :**
- Champ texte libre pour les conditions spécifiques à chaque bail (animaux, sous-location, travaux, etc.)

### 1.2 Acceptance Scenarios — Bail

1. **Given** le gestionnaire crée un bail, **When** il remplit tous les champs (loyer, charges, jour limite, pénalités, conditions de renouvellement), **Then** le bail est créé avec tous les termes enregistrés et la date de fin calculée automatiquement.

2. **Given** un bail a le champ "jour limite = 5", **When** le locataire n'a pas payé au 5 du mois, **Then** après le délai de grâce, le système calcule et applique la pénalité de retard automatiquement.

3. **Given** un bail a "renouvellement automatique = Oui" et "durée renouvellement = 12 mois", **When** le bail arrive à échéance et le locataire est à jour de ses paiements, **Then** le bail est automatiquement renouvelé pour 12 mois avec les nouvelles dates.

4. **Given** un bail a "renouvellement automatique = Oui" mais le locataire a des impayés, **When** le bail arrive à échéance, **Then** le bail n'est PAS renouvelé, le statut passe à "Expiré", une notification est envoyée.

5. **Given** un bail a "motif suspension = 3 mois d'impayés", **When** le locataire accumule 3 mois d'impayés, **Then** le bail est automatiquement suspendu, une mise en demeure est envoyée par email.

---

## 2. CHARGES LOCATIVES

### 2.1 Données

Les charges locatives sont définies par bail et peuvent varier d'un appartement à l'autre :

- **Type de charge** : Eau, Électricité parties communes, Gardiennage, Entretien immeuble, Ordures ménagères, Autre (personnalisable)
- **Montant** (FCFA) par charge
- **Fréquence** : Mensuelle (par défaut)
- **Total charges** = somme de toutes les charges

Le total mensuel dû par le locataire = loyer + total charges.

### 2.2 Acceptance Scenarios — Charges

1. **Given** le gestionnaire crée un bail, **When** il ajoute des charges (Eau: 5000, Gardiennage: 3000, Ordures: 2000), **Then** le total charges = 10 000 FCFA et le total mensuel dû = loyer + 10 000.

2. **Given** un bail a des charges de 10 000 FCFA, **When** le locataire paie son loyer mais pas les charges, **Then** le paiement est marqué "Partiellement payé" avec le reste dû = montant charges.

3. **Given** le gestionnaire modifie les charges en cours de bail, **When** il change le montant du gardiennage de 3000 à 5000, **Then** le nouveau montant s'applique à partir du mois suivant.

---

## 3. SYSTÈME DE NOTIFICATIONS ET ACTIONS AUTOMATIQUES

### 3.1 Rappel d'échéance de paiement

- **Quand** : X jours avant le jour limite de paiement (configurable, par défaut 3 jours avant)
- **Canal** : Email
- **Contenu** : "Votre loyer de [mois] d'un montant de [total mensuel] FCFA est dû le [jour limite]. Merci de procéder au paiement."
- **Log** : Enregistré dans l'historique des emails

### 3.2 Notification d'impayé

- **Quand** : Le jour suivant le jour limite si aucun paiement n'est enregistré
- **Canal** : Email
- **Contenu** : "Votre loyer de [mois] n'a pas été réglé à la date prévue du [jour limite]. Montant dû : [total]. Merci de régulariser votre situation."
- **Log** : Enregistré

### 3.3 Pénalité de retard

- **Quand** : Après le délai de grâce (ex : jour limite + 5 jours)
- **Action** : Le système calcule la pénalité (% du loyer ou montant fixe) et l'ajoute au montant dû
- **Notification** : Email au locataire "Une pénalité de retard de [montant] FCFA a été appliquée à votre compte."
- **Récurrence** : La pénalité peut être récurrente (ex : chaque semaine de retard supplémentaire) selon les termes du bail

### 3.4 Mise en demeure

- **Quand** : Après N mois d'impayés consécutifs (configurable par bail, par défaut 2 mois)
- **Canal** : Email formel
- **Contenu** : Lettre de mise en demeure formelle avec :
  - Récapitulatif des mois impayés
  - Montant total dû (loyers + charges + pénalités)
  - Délai pour régulariser (ex : 15 jours)
  - Mention des conséquences (suspension du bail)
- **Log** : Enregistré avec type "MISE_EN_DEMEURE"

### 3.5 Suspension automatique du bail

- **Quand** : Après N mois d'impayés (configurable par bail, par défaut 3 mois) OU après expiration du délai de mise en demeure sans régularisation
- **Action** :
  - Le statut du bail passe à "SUSPENDU"
  - L'appartement reste marqué "Occupé" (le locataire est encore physiquement là)
  - Notification email au locataire
  - Alerte sur le dashboard du gestionnaire
- **Le gestionnaire peut** : lever la suspension manuellement si le locataire régularise

### 3.6 Renouvellement automatique

- **Quand** : À la date de fin du bail
- **Conditions** :
  - Le bail a "renouvellement automatique = Oui"
  - Le locataire est à jour de TOUS ses paiements (loyers + charges + pénalités)
  - Aucune mise en demeure active
- **Action si conditions remplies** :
  - Création automatique d'un nouveau bail
  - Durée = durée de renouvellement définie dans le bail
  - Loyer = ancien loyer + augmentation si définie
  - Charges = mêmes charges
  - Notification email au locataire "Votre bail a été renouvelé pour [durée] mois."
  - Log dans l'historique
- **Action si conditions NON remplies** :
  - Le bail passe en statut "Expiré"
  - Notification email au locataire "Votre bail n'a pas été renouvelé en raison d'impayés."
  - Alerte sur le dashboard

### 3.7 Rappel d'expiration de bail

- **Quand** : 60 jours, 30 jours et 15 jours avant la fin du bail
- **Canal** : Email au locataire + alerte dashboard gestionnaire
- **Contenu** : "Votre bail expire le [date]. [Si renouvellement auto : Il sera renouvelé automatiquement si vous êtes à jour. / Si pas de renouvellement auto : Merci de contacter la gestion pour discuter du renouvellement.]"

---

## 4. PHOTO DES LOCATAIRES

### 4.1 Données

- **Photo d'identité** : Image (JPG, PNG) uploadée lors de la création ou modification du locataire
- **Stockage** : Upload vers un service de stockage (Vercel Blob ou dossier public)
- **Affichage** : Avatar du locataire visible sur :
  - La fiche locataire
  - La liste des locataires
  - Le détail du bail
  - Le portail locataire (son propre avatar)

### 4.2 Acceptance Scenarios — Photo

1. **Given** le gestionnaire ajoute un locataire, **When** il uploade une photo, **Then** la photo est sauvegardée et affichée comme avatar du locataire.

2. **Given** un locataire existe sans photo, **When** le gestionnaire modifie sa fiche et ajoute une photo, **Then** la photo est mise à jour.

3. **Given** un locataire a une photo, **When** on affiche la liste des locataires, **Then** la photo apparaît en miniature à côté du nom.

4. **Given** aucune photo n'est uploadée, **Then** un avatar par défaut (initiales du nom) est affiché.

---

## 5. TABLEAU DE BORD AMÉLIORÉ

Le dashboard doit afficher les alertes automatiques :

- **Paiements en retard** : Liste des locataires en retard avec nombre de jours de retard et montant dû (loyer + charges + pénalités)
- **Baux expirant bientôt** : 60, 30, 15 jours
- **Baux suspendus** : Liste des baux suspendus avec motif
- **Mises en demeure actives** : Nombre et détails
- **Renouvellements récents** : Baux renouvelés automatiquement ce mois
- **Revenus** : Graphique avec distinction loyers / charges / pénalités

---

## 6. CRON JOB — Automatisations quotidiennes

Un job automatique doit s'exécuter **chaque jour** pour :

1. **Vérifier les paiements en retard** → envoyer notifications d'impayé
2. **Calculer les pénalités de retard** → ajouter au montant dû
3. **Vérifier les mises en demeure** → envoyer si seuil atteint
4. **Suspendre les baux** → si seuil d'impayés atteint
5. **Renouveler les baux** → si date de fin atteinte et conditions remplies
6. **Envoyer les rappels d'échéance** → X jours avant le jour limite
7. **Envoyer les rappels d'expiration** → 60, 30, 15 jours avant fin de bail

Ce job sera implémenté comme une **API Route** (`/api/cron`) appelée par un service cron externe (Vercel Cron ou cron-job.org).

---

## 7. MODÈLE DE DONNÉES — Modifications

### Bail (champs ajoutés)
```
chargesLocatives     Json        // [{type: "Eau", montant: 5000}, ...]
totalCharges         Int         // somme des charges
totalMensuel         Int         // loyer + totalCharges
jourLimitePaiement   Int         // jour du mois (1-28)
delaiGrace           Int         // jours après jour limite avant pénalité
penaliteType         Enum        // POURCENTAGE ou MONTANT_FIXE
penaliteMontant      Int         // % ou montant en FCFA
penaliteRecurrente   Boolean     // pénalité chaque semaine de retard ?
renouvellementAuto   Boolean     // renouvellement automatique ?
dureeRenouvellement  Int?        // durée en mois si renouvellement
augmentationLoyer    Int?        // % d'augmentation au renouvellement
preavisNonRenouv     Int         // jours de préavis
preavisResiliation   Int         // jours de préavis résiliation
seuilMiseEnDemeure   Int         // mois d'impayés avant mise en demeure
seuilSuspension      Int         // mois d'impayés avant suspension
clausesParticulieres String?     // texte libre
statut               Enum        // ACTIF, SUSPENDU, RESILIE, TERMINE, EXPIRE
```

### Locataire (champ ajouté)
```
photo                String?     // URL de la photo uploadée
```

### Paiement (champs ajoutés)
```
montantLoyer         Int         // part loyer dans le paiement
montantCharges       Int         // part charges dans le paiement
penalites            Int         // pénalités incluses
totalDu              Int         // loyer + charges + pénalités du mois
```

### EmailLog (types ajoutés)
```
enum TypeEmail {
  RAPPEL_ECHEANCE       // rappel avant jour limite
  RAPPEL_PAIEMENT       // rappel après jour limite (impayé)
  RECU_PAIEMENT         // reçu après paiement
  NOTIFICATION_PENALITE // notification de pénalité appliquée
  MISE_EN_DEMEURE       // mise en demeure formelle
  SUSPENSION_BAIL       // notification de suspension
  RENOUVELLEMENT_BAIL   // confirmation de renouvellement
  EXPIRATION_BAIL       // rappel d'expiration (60j, 30j, 15j)
  NON_RENOUVELLEMENT    // bail non renouvelé (impayés)
}
```

### Nouveau modèle : Penalite
```
model Penalite {
  id              String    @id
  bailId          String
  bail            Bail
  moisConcerne    DateTime
  montant         Int       // montant de la pénalité
  motif           String    // "Retard de paiement — Semaine 1"
  appliqueLe      DateTime
  payee           Boolean   @default(false)
}
```

---

## 8. RÉSUMÉ DES AUTOMATISATIONS

| Événement | Action automatique | Notification |
|---|---|---|
| X jours avant jour limite | — | Email rappel d'échéance |
| Jour limite dépassé | — | Email notification impayé |
| Jour limite + délai grâce | Calcul pénalité | Email notification pénalité |
| Chaque semaine de retard (si récurrent) | Nouvelle pénalité | Email notification pénalité |
| N mois d'impayés (seuil mise en demeure) | — | Email mise en demeure |
| N mois d'impayés (seuil suspension) | Suspension bail | Email suspension |
| 60j / 30j / 15j avant fin bail | — | Email rappel expiration |
| Fin de bail + locataire à jour | Renouvellement auto | Email confirmation |
| Fin de bail + impayés | Bail expiré | Email non-renouvellement |
| Paiement enregistré | Calcul reste dû | Email reçu |

---

## 9. PRIORITÉ D'IMPLÉMENTATION

**Phase 1 (critique) :**
- Mise à jour du modèle Bail avec tous les termes du contrat
- Charges locatives
- Photo locataire
- Jour limite + pénalités de retard

**Phase 2 (important) :**
- Notifications automatiques (rappel, impayé, pénalité)
- Mise en demeure
- Suspension automatique

**Phase 3 (complet) :**
- Renouvellement automatique
- Rappels d'expiration
- Cron job quotidien
- Dashboard amélioré avec toutes les alertes
