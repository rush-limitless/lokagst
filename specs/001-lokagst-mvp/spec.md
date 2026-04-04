# Feature Specification: LokaGest — Application de Gestion Locative

**Feature Branch**: `001-lokagst-mvp`
**Created**: 2026-04-04
**Status**: Draft
**Input**: Application web professionnelle de gestion des locataires d'un immeuble R+4 à Yaoundé pour l'entreprise FINSTAR.

## User Scenarios & Testing

### User Story 1 — Gestion des appartements (Priority: P1)

Le gestionnaire peut créer, modifier et visualiser tous les appartements de l'immeuble avec leur statut (libre/occupé), leur étage, leur numéro et leur loyer de base.

**Why this priority**: Sans appartements référencés, aucune autre fonctionnalité ne peut fonctionner. C'est la fondation du système.

**Independent Test**: Le gestionnaire peut se connecter, ajouter un appartement "A1 - RDC - Studio - 50 000 FCFA", le voir dans la liste, le modifier, et vérifier que le statut est "Libre".

**Acceptance Scenarios**:

1. **Given** le gestionnaire est connecté, **When** il clique sur "Ajouter un appartement" et remplit le formulaire (numéro: A1, étage: RDC, type: Studio, loyer: 50000, description: "Studio meublé"), **Then** l'appartement apparaît dans la liste avec le statut "Libre".
2. **Given** un appartement A1 existe, **When** le gestionnaire modifie le loyer de 50000 à 55000, **Then** le nouveau loyer est affiché et sauvegardé.
3. **Given** la liste des appartements est affichée, **When** le gestionnaire filtre par étage "2ème étage", **Then** seuls les appartements du 2ème étage sont affichés.
4. **Given** un appartement est occupé, **When** le gestionnaire consulte la liste, **Then** le statut "Occupé" est affiché en rouge avec le nom du locataire actuel.

---

### User Story 2 — Gestion des locataires (Priority: P1)

Le gestionnaire peut ajouter, modifier, supprimer et rechercher des locataires. Chaque locataire est associé à un appartement.

**Why this priority**: Les locataires sont le cœur du métier. Sans eux, pas de loyers ni de contrats.

**Independent Test**: Le gestionnaire ajoute un locataire "Jean Dupont", l'associe à l'appartement A1, vérifie que A1 passe en statut "Occupé", puis recherche "Jean" et le retrouve.

**Acceptance Scenarios**:

1. **Given** le gestionnaire est sur la page locataires, **When** il ajoute un locataire (nom: Dupont, prénom: Jean, téléphone: 6XXXXXXXX, CNI: XXXXXXXXX, appartement: A1, date d'entrée: 01/04/2026), **Then** le locataire est créé et l'appartement A1 passe en statut "Occupé".
2. **Given** un locataire Jean Dupont existe, **When** le gestionnaire modifie son numéro de téléphone, **Then** la modification est sauvegardée.
3. **Given** un locataire Jean Dupont existe, **When** le gestionnaire le supprime (départ), **Then** le locataire est archivé (pas supprimé définitivement), l'appartement repasse en "Libre".
4. **Given** 20 locataires existent, **When** le gestionnaire recherche "Dup", **Then** tous les locataires dont le nom contient "Dup" sont affichés.

---

### User Story 3 — Gestion des contrats/baux (Priority: P2)

Le gestionnaire peut créer un contrat de bail lié à un locataire et un appartement, avec date de début, durée, montant du loyer, et caution.

**Why this priority**: Le contrat formalise la relation locataire-appartement et définit les conditions financières.

**Independent Test**: Le gestionnaire crée un bail pour Jean Dupont dans l'appartement A1, durée 12 mois, loyer 50 000 FCFA, caution 100 000 FCFA. Le contrat apparaît dans la fiche du locataire et de l'appartement.

**Acceptance Scenarios**:

1. **Given** un locataire et un appartement existent, **When** le gestionnaire crée un bail (début: 01/04/2026, durée: 12 mois, loyer: 50000, caution: 100000), **Then** le bail est créé avec statut "Actif" et date de fin calculée automatiquement (31/03/2027).
2. **Given** un bail arrive à échéance dans 30 jours, **When** le gestionnaire consulte le tableau de bord, **Then** une alerte "Bail expirant bientôt" est affichée.
3. **Given** un bail est actif, **When** le gestionnaire le résilie, **Then** le statut passe à "Résilié", l'appartement repasse en "Libre", le locataire est archivé.
4. **Given** un bail existe, **When** le gestionnaire le renouvelle, **Then** un nouveau bail est créé avec les nouvelles dates et l'ancien est marqué "Terminé".

---

### User Story 4 — Suivi des paiements de loyer (Priority: P1)

Le gestionnaire peut enregistrer les paiements de loyer, voir l'historique des paiements par locataire, et identifier les retards.

**Why this priority**: Le suivi financier est la raison d'être principale de l'application pour le propriétaire.

**Independent Test**: Le gestionnaire enregistre un paiement de 50 000 FCFA pour Jean Dupont (mois d'avril 2026), vérifie que le mois est marqué "Payé", puis constate que mai 2026 est "En attente".

**Acceptance Scenarios**:

1. **Given** un locataire avec un bail actif, **When** le gestionnaire enregistre un paiement (montant: 50000, mois: Avril 2026, mode: Espèces), **Then** le paiement est enregistré, le mois est marqué "Payé".
2. **Given** un locataire n'a pas payé depuis 2 mois, **When** le gestionnaire consulte la liste des locataires, **Then** le locataire est surligné en rouge avec mention "2 mois d'impayés".
3. **Given** un locataire a un historique de paiements, **When** le gestionnaire consulte sa fiche, **Then** un tableau affiche tous les paiements (date, montant, mois concerné, mode de paiement, statut).
4. **Given** un paiement partiel de 30 000 sur un loyer de 50 000, **When** le gestionnaire l'enregistre, **Then** le mois est marqué "Partiellement payé" avec le reste dû (20 000).

---

### User Story 5 — Tableau de bord et statistiques (Priority: P2)

Le gestionnaire voit un tableau de bord avec les indicateurs clés : taux d'occupation, revenus du mois, impayés, baux expirant bientôt.

**Why this priority**: Le tableau de bord donne une vue d'ensemble indispensable mais dépend des données des autres modules.

**Independent Test**: Le gestionnaire se connecte et voit immédiatement : nombre d'appartements occupés/libres, total des loyers encaissés ce mois, montant total des impayés, liste des baux expirant dans 30 jours.

**Acceptance Scenarios**:

1. **Given** 10 appartements dont 7 occupés, **When** le gestionnaire ouvre le tableau de bord, **Then** il voit "Taux d'occupation : 70% (7/10)" avec une jauge visuelle.
2. **Given** 5 locataires ont payé ce mois (total 250 000 FCFA) et 2 n'ont pas payé (total 100 000 FCFA), **When** le gestionnaire consulte le dashboard, **Then** il voit "Revenus du mois : 250 000 FCFA" et "Impayés : 100 000 FCFA".
3. **Given** 2 baux expirent dans les 30 prochains jours, **When** le gestionnaire consulte le dashboard, **Then** une section "Alertes" affiche les 2 baux avec le nom du locataire et la date d'expiration.
4. **Given** le gestionnaire est sur le dashboard, **When** il sélectionne une période (ex: "6 derniers mois"), **Then** un graphique affiche l'évolution des revenus mois par mois.

---

### User Story 6 — Portail locataire (Priority: P3)

Chaque locataire peut se connecter avec un compte dédié pour consulter son bail, son historique de paiements, et le solde restant dû.

**Why this priority**: C'est un plus pour la transparence mais pas critique pour le fonctionnement de base.

**Independent Test**: Un locataire se connecte avec son email/mot de passe, voit son bail actif, son historique de paiements, et le montant restant dû.

**Acceptance Scenarios**:

1. **Given** un locataire a un compte, **When** il se connecte, **Then** il voit son tableau de bord personnel : appartement, bail actif, prochain loyer dû.
2. **Given** un locataire est connecté, **When** il consulte son historique, **Then** il voit la liste de tous ses paiements avec dates et montants.
3. **Given** un locataire a un impayé, **When** il consulte son espace, **Then** il voit clairement le montant dû et les mois concernés.
4. **Given** un locataire est connecté, **When** il consulte son bail, **Then** il voit les détails (date début, date fin, montant loyer, caution versée).

---

### User Story 7 — Authentification et rôles (Priority: P1)

Le système gère deux rôles : Gestionnaire (accès complet) et Locataire (accès limité à ses propres données). L'authentification est sécurisée par email/mot de passe.

**Why this priority**: La sécurité et la séparation des accès sont fondamentales dès le départ.

**Independent Test**: Un gestionnaire se connecte et accède à tout. Un locataire se connecte et ne voit que ses propres données. Un utilisateur non authentifié est redirigé vers la page de connexion.

**Acceptance Scenarios**:

1. **Given** un utilisateur non connecté, **When** il accède à n'importe quelle page, **Then** il est redirigé vers la page de connexion.
2. **Given** un gestionnaire se connecte, **When** il accède au système, **Then** il voit le menu complet (Dashboard, Appartements, Locataires, Contrats, Paiements).
3. **Given** un locataire se connecte, **When** il accède au système, **Then** il ne voit que son espace personnel (Mon bail, Mes paiements).
4. **Given** un utilisateur entre un mauvais mot de passe 5 fois, **When** il tente une 6ème connexion, **Then** le compte est temporairement bloqué (15 minutes).

---

### Edge Cases

- Que se passe-t-il si on essaie d'assigner un locataire à un appartement déjà occupé ? → Erreur avec message "Cet appartement est déjà occupé par [nom]".
- Que se passe-t-il si on supprime un appartement qui a un bail actif ? → Impossible, message "Cet appartement a un bail actif. Résiliez d'abord le bail."
- Que se passe-t-il si un paiement dépasse le montant du loyer ? → Accepté, le surplus est noté comme "Avance" sur le mois suivant.
- Que se passe-t-il si le gestionnaire modifie le loyer en cours de bail ? → Le loyer du bail reste inchangé. Le nouveau loyer s'appliquera au prochain bail.
- Que se passe-t-il en cas de perte de connexion pendant un enregistrement ? → Message d'erreur clair, les données non sauvegardées sont conservées localement.

## Requirements

### Functional Requirements

- **FR-001**: Le système DOIT permettre la gestion CRUD complète des appartements (numéro, étage, type, loyer de base, description, statut).
- **FR-002**: Le système DOIT permettre la gestion CRUD des locataires (nom, prénom, téléphone, email, CNI/pièce d'identité, photo optionnelle).
- **FR-003**: Le système DOIT permettre la création, le renouvellement et la résiliation de contrats de bail.
- **FR-004**: Le système DOIT permettre l'enregistrement des paiements de loyer avec mode de paiement (Espèces, Mobile Money, Virement).
- **FR-005**: Le système DOIT calculer automatiquement les impayés et les retards de paiement.
- **FR-006**: Le système DOIT afficher un tableau de bord avec indicateurs clés (taux d'occupation, revenus, impayés, alertes).
- **FR-007**: Le système DOIT gérer deux rôles : Gestionnaire (accès complet) et Locataire (accès limité).
- **FR-008**: Le système DOIT authentifier les utilisateurs par email et mot de passe avec hachage bcrypt.
- **FR-009**: Le système DOIT archiver les locataires partis (soft delete) plutôt que les supprimer définitivement.
- **FR-010**: Le système DOIT calculer automatiquement la date de fin de bail à partir de la date de début et de la durée.
- **FR-011**: Le système DOIT gérer les paiements partiels et calculer le reste dû.
- **FR-012**: Le système DOIT permettre au locataire de consulter son bail et son historique de paiements via un portail dédié.
- **FR-013**: Le système DOIT afficher des graphiques d'évolution des revenus sur le tableau de bord.
- **FR-014**: Le système DOIT permettre la recherche et le filtrage sur toutes les listes (appartements, locataires, paiements).
- **FR-015**: Le système DOIT être responsive (utilisable sur mobile et desktop).
- **FR-016**: Le système DOIT afficher les montants en Francs CFA (FCFA) avec séparateur de milliers.

### Key Entities

- **Appartement**: Numéro, étage (RDC, 1er, 2ème, 3ème, 4ème), type (Studio, T2, T3, T4), loyer de base (FCFA), description, statut (Libre/Occupé), date de création.
- **Locataire**: Nom, prénom, téléphone, email, numéro CNI, photo (optionnel), appartement assigné, date d'entrée, statut (Actif/Archivé).
- **Bail**: Locataire, appartement, date de début, durée (mois), date de fin (calculée), montant loyer, montant caution, statut (Actif/Résilié/Terminé/Expiré).
- **Paiement**: Bail, montant payé, mois concerné, date de paiement, mode de paiement (Espèces/Mobile Money/Virement), statut (Payé/Partiellement payé), notes.
- **Utilisateur**: Email, mot de passe (hashé), rôle (Gestionnaire/Locataire), locataire associé (si rôle Locataire), statut (Actif/Bloqué).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Le gestionnaire peut ajouter un appartement et un locataire en moins de 2 minutes.
- **SC-002**: Le gestionnaire peut enregistrer un paiement en moins de 30 secondes.
- **SC-003**: Le tableau de bord se charge en moins de 3 secondes.
- **SC-004**: Le système supporte au moins 50 utilisateurs simultanés sans dégradation.
- **SC-005**: 100% des données financières (paiements, loyers, impayés) sont exactes et cohérentes.
- **SC-006**: Le locataire peut consulter son solde en moins de 2 clics après connexion.
- **SC-007**: L'application est utilisable sur un smartphone avec écran 5 pouces minimum.

## Assumptions

- L'immeuble est unique (un seul bâtiment R+4 à Nkolfoulou, Yaoundé).
- Les montants sont exclusivement en Francs CFA (FCFA).
- La connexion Internet est disponible (via Starlink V2).
- Le gestionnaire est le seul administrateur du système.
- Les paiements sont enregistrés manuellement (pas d'intégration Mobile Money automatique en v1).
- Le nombre d'appartements est inférieur à 50.
- Le nombre de locataires actifs est inférieur à 100.
- L'application sera hébergée sur un serveur accessible via le réseau local ou Internet.
- La langue de l'interface est le français.
