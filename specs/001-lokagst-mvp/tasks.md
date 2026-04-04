# Tasks: LokaGest — Application de Gestion Locative

**Input**: Design documents from `specs/001-lokagst-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut être exécuté en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User Story concernée (US1=Appartements, US2=Locataires, US3=Baux, US4=Paiements, US5=Dashboard, US6=Portail locataire, US7=Auth)

---

## Phase 1: Setup (Infrastructure partagée)

**Purpose**: Initialisation du projet et structure de base

- [ ] T001 Initialiser le projet Next.js 14 avec TypeScript, Tailwind CSS, ESLint dans `lokagst/`
  ```bash
  npx create-next-app@14 lokagst --typescript --tailwind --eslint --app --src-dir
  ```
- [ ] T002 Installer les dépendances : `prisma @prisma/client next-auth@beta bcryptjs zod recharts`
  ```bash
  npm install @prisma/client next-auth@beta bcryptjs zod recharts
  npm install -D prisma @types/bcryptjs
  ```
- [ ] T003 [P] Initialiser Prisma : `npx prisma init` — configurer `DATABASE_URL` dans `.env.local`
- [ ] T004 [P] Installer et configurer shadcn/ui : `npx shadcn-ui@latest init` puis ajouter les composants nécessaires
  ```bash
  npx shadcn-ui@latest add button card input label select table badge dialog form toast tabs separator sheet dropdown-menu avatar
  ```
- [ ] T005 [P] Créer le fichier `src/lib/utils.ts` avec les utilitaires :
  - `formatFCFA(montant: number): string` — formatage monétaire FCFA avec séparateur de milliers
  - `formatDate(date: Date): string` — formatage date en français (ex: "4 avril 2026")
  - `cn(...classes)` — utilitaire Tailwind classnames (fourni par shadcn)

**Checkpoint**: Projet initialisé, dépendances installées, prêt pour le développement.

---

## Phase 2: Foundational (Prérequis bloquants)

**Purpose**: Base de données, authentification et layout — DOIT être terminé avant toute User Story

**⚠️ CRITICAL**: Aucune User Story ne peut commencer avant la fin de cette phase.

- [ ] T006 Créer le schéma Prisma complet dans `prisma/schema.prisma` selon `data-model.md` :
  - Models: Utilisateur, Appartement, Locataire, Bail, Paiement
  - Enums: Role, StatutUtilisateur, Etage, TypeAppartement, StatutAppartement, StatutLocataire, StatutBail, ModePaiement, StatutPaiement
  - Relations, index, contraintes d'unicité
- [ ] T007 Exécuter la première migration : `npx prisma migrate dev --name init`
- [ ] T008 Créer le seed `prisma/seed.ts` :
  - 1 utilisateur gestionnaire (admin@finstar.cm / mot de passe hashé)
  - 10 appartements répartis sur les 5 niveaux (RDC à 4ème)
  - 5 locataires avec baux actifs
  - Quelques paiements de test
  - Configurer `"prisma": { "seed": "ts-node prisma/seed.ts" }` dans package.json
- [ ] T009 [P] Créer `src/lib/prisma.ts` — singleton du client Prisma (éviter les connexions multiples en dev)
- [ ] T010 [P] Créer `src/lib/validations.ts` — schémas Zod pour toutes les entités :
  - `appartementSchema`, `locataireSchema`, `bailSchema`, `paiementSchema`, `loginSchema`
- [ ] T011 Configurer NextAuth.js dans `src/lib/auth.ts` :
  - Credentials provider (email + mot de passe)
  - Vérification bcrypt
  - Session JWT avec rôle et userId
  - Callback `authorized` pour protéger les routes
- [ ] T012 Créer le middleware `src/middleware.ts` :
  - Routes `/login` accessibles sans auth
  - Routes `/(gestionnaire)/*` réservées au rôle GESTIONNAIRE
  - Routes `/(locataire)/*` réservées au rôle LOCATAIRE
  - Redirection vers `/login` si non authentifié
- [ ] T013 Créer le layout racine `src/app/layout.tsx` :
  - Providers (SessionProvider, ThemeProvider)
  - Font Inter
  - Metadata (titre "LokaGest", description)
  - Toaster pour les notifications
- [ ] T014 Créer la page de connexion `src/app/login/page.tsx` :
  - Formulaire email + mot de passe
  - Validation Zod côté client
  - Gestion des erreurs (mauvais identifiants, compte bloqué)
  - Redirection vers dashboard après connexion
  - Logo LokaGest en haut du formulaire
- [ ] T015 [P] Créer le layout gestionnaire `src/app/(gestionnaire)/layout.tsx` :
  - Sidebar avec navigation : Dashboard, Appartements, Locataires, Contrats, Paiements
  - Header avec nom de l'utilisateur, bouton déconnexion
  - Responsive : sidebar en sheet sur mobile
- [ ] T016 [P] Créer le layout locataire `src/app/(locataire)/layout.tsx` :
  - Header simplifié avec "Mon espace", bouton déconnexion
  - Navigation : Mon bail, Mes paiements
- [ ] T017 Créer `src/app/page.tsx` — redirection selon le rôle :
  - GESTIONNAIRE → `/dashboard`
  - LOCATAIRE → `/mon-espace`
  - Non connecté → `/login`

**Checkpoint**: Auth fonctionnelle, layouts en place, base de données prête avec données de test.

---

## Phase 3: User Story 7 — Authentification et rôles (Priority: P1) 🔐

**Goal**: Système d'authentification complet avec gestion des rôles et blocage après 5 tentatives.

**Independent Test**: Se connecter en tant que gestionnaire → voir le menu complet. Se connecter en tant que locataire → voir uniquement "Mon espace". Entrer 5 mauvais mots de passe → compte bloqué 15 min.

- [ ] T018 [US7] Créer `src/actions/auth.ts` — Server Actions :
  - `login(email, motDePasse)` : vérification bcrypt, gestion tentatives échouées, blocage 15 min après 5 échecs
  - `logout()` : déconnexion et redirection
  - `getSession()` : récupérer la session courante avec rôle
- [ ] T019 [US7] Implémenter la logique de blocage dans le credentials provider :
  - Incrémenter `tentativesEchouees` à chaque échec
  - Si `tentativesEchouees >= 5` → définir `bloqueJusqua = now() + 15min`
  - Réinitialiser `tentativesEchouees` après connexion réussie
  - Vérifier `bloqueJusqua` avant toute tentative

**Checkpoint**: Authentification complète, rôles fonctionnels, blocage opérationnel.

---

## Phase 4: User Story 1 — Gestion des appartements (Priority: P1) 🏠

**Goal**: CRUD complet des appartements avec filtrage et statut automatique.

**Independent Test**: Ajouter un appartement, le modifier, filtrer par étage, vérifier le statut.

- [ ] T020 [US1] Créer `src/actions/appartements.ts` — Server Actions selon `contracts/appartements.md` :
  - `getAppartements(filters?)` : liste avec filtres (étage, statut, recherche), inclure locataire actuel
  - `getAppartement(id)` : détail avec historique des baux
  - `creerAppartement(data)` : validation Zod, vérification unicité numéro
  - `modifierAppartement(id, data)` : validation, règle loyer/bail actif
  - `supprimerAppartement(id)` : vérification pas de bail actif
- [ ] T021 [P] [US1] Créer `src/components/forms/appartement-form.tsx` :
  - Formulaire réutilisable (création + modification)
  - Champs : numéro, étage (select), type (select), loyer (input number), description (textarea)
  - Validation Zod côté client avec messages d'erreur en français
  - Formatage automatique du loyer en FCFA
- [ ] T022 [P] [US1] Créer `src/components/tables/appartements-table.tsx` :
  - Tableau avec colonnes : Numéro, Étage, Type, Loyer, Statut, Locataire, Actions
  - Badge coloré pour le statut (vert=Libre, rouge=Occupé)
  - Boutons actions : Voir, Modifier, Supprimer
  - Filtres en haut : étage (select), statut (select), recherche (input)
- [ ] T023 [US1] Créer `src/app/(gestionnaire)/appartements/page.tsx` :
  - Liste des appartements avec table et filtres
  - Bouton "Ajouter un appartement"
  - Compteur : "X appartements (Y occupés, Z libres)"
- [ ] T024 [US1] Créer `src/app/(gestionnaire)/appartements/nouveau/page.tsx` :
  - Formulaire de création
  - Redirection vers la liste après succès avec toast de confirmation
- [ ] T025 [US1] Créer `src/app/(gestionnaire)/appartements/[id]/page.tsx` :
  - Vue détail + formulaire de modification
  - Section historique des baux (si existants)
  - Bouton supprimer (avec confirmation dialog)

**Checkpoint**: Gestion complète des appartements fonctionnelle.

---

## Phase 5: User Story 2 — Gestion des locataires (Priority: P1) 👤

**Goal**: CRUD des locataires avec association appartement et archivage.

**Independent Test**: Ajouter un locataire, l'associer à un appartement, vérifier le statut, archiver.

- [ ] T026 [US2] Créer `src/actions/locataires.ts` — Server Actions selon `contracts/locataires.md` :
  - `getLocataires(filters?)` : liste avec recherche, statut, nombre d'impayés
  - `getLocataire(id)` : détail complet avec baux et paiements
  - `creerLocataire(data)` : validation, vérification appartement libre, mise à jour statut appartement
  - `modifierLocataire(id, data)` : validation
  - `archiverLocataire(id)` : soft delete, résiliation bail, libération appartement
- [ ] T027 [P] [US2] Créer `src/components/forms/locataire-form.tsx` :
  - Champs : nom, prénom, téléphone, email, CNI, appartement (select des libres), date d'entrée
  - Validation téléphone format camerounais
- [ ] T028 [P] [US2] Créer `src/components/tables/locataires-table.tsx` :
  - Colonnes : Nom complet, Téléphone, Appartement, Statut, Impayés, Actions
  - Surbrillance rouge si impayés > 0
  - Recherche par nom/prénom
  - Filtre par statut (Actif/Archivé)
- [ ] T029 [US2] Créer `src/app/(gestionnaire)/locataires/page.tsx` — liste avec filtres
- [ ] T030 [US2] Créer `src/app/(gestionnaire)/locataires/nouveau/page.tsx` — formulaire création
- [ ] T031 [US2] Créer `src/app/(gestionnaire)/locataires/[id]/page.tsx` — détail + modification + archivage

**Checkpoint**: Gestion complète des locataires fonctionnelle.

---

## Phase 6: User Story 3 — Gestion des baux (Priority: P2) 📄

**Goal**: Création, renouvellement et résiliation des contrats de bail.

**Independent Test**: Créer un bail, vérifier la date de fin calculée, renouveler, résilier.

- [ ] T032 [US3] Créer `src/actions/baux.ts` — Server Actions selon `contracts/baux.md` :
  - `getBaux(filters?)` : liste avec statut, baux expirants
  - `getBail(id)` : détail avec paiements associés
  - `creerBail(data)` : calcul dateFin, validation
  - `resilierBail(id)` : cascade statuts (bail, appartement, locataire)
  - `renouvelerBail(id, data)` : ancien → TERMINE, nouveau bail créé
- [ ] T033 [P] [US3] Créer `src/components/forms/bail-form.tsx` :
  - Champs : locataire (select), appartement (select), date début, durée (mois), loyer, caution
  - Calcul et affichage automatique de la date de fin
- [ ] T034 [P] [US3] Créer `src/components/tables/baux-table.tsx` :
  - Colonnes : Locataire, Appartement, Début, Fin, Loyer, Statut, Jours restants, Actions
  - Badge coloré statut (vert=Actif, orange=Expirant, rouge=Résilié, gris=Terminé)
- [ ] T035 [US3] Créer `src/app/(gestionnaire)/baux/page.tsx` — liste des baux
- [ ] T036 [US3] Créer `src/app/(gestionnaire)/baux/nouveau/page.tsx` — formulaire création
- [ ] T037 [US3] Créer `src/app/(gestionnaire)/baux/[id]/page.tsx` — détail + renouveler + résilier

**Checkpoint**: Gestion complète des baux fonctionnelle.

---

## Phase 7: User Story 4 — Suivi des paiements (Priority: P1) 💰

**Goal**: Enregistrement des paiements, historique, détection des impayés.

**Independent Test**: Enregistrer un paiement complet, un paiement partiel, vérifier les impayés.

- [ ] T038 [US4] Créer `src/actions/paiements.ts` — Server Actions selon `contracts/paiements.md` :
  - `getPaiements(filters?)` : liste avec filtres (bail, locataire, période)
  - `enregistrerPaiement(data)` : logique paiement complet/partiel/surplus, mise à jour ou création
  - `getImpayesParLocataire()` : calcul des mois impayés par locataire
- [ ] T039 [P] [US4] Créer `src/components/forms/paiement-form.tsx` :
  - Champs : locataire/bail (select), montant, mois concerné (date picker mois), mode de paiement, notes
  - Affichage du loyer attendu et du reste dû en temps réel
- [ ] T040 [P] [US4] Créer `src/components/tables/paiements-table.tsx` :
  - Colonnes : Locataire, Appartement, Mois, Montant, Mode, Statut, Reste dû, Date
  - Badge statut (vert=Payé, orange=Partiel)
  - Filtres par locataire et période
- [ ] T041 [US4] Créer `src/app/(gestionnaire)/paiements/page.tsx` — liste des paiements
- [ ] T042 [US4] Créer `src/app/(gestionnaire)/paiements/nouveau/page.tsx` — formulaire enregistrement

**Checkpoint**: Suivi des paiements complet et fonctionnel.

---

## Phase 8: User Story 5 — Tableau de bord (Priority: P2) 📊

**Goal**: Dashboard avec indicateurs clés, alertes et graphiques.

**Independent Test**: Voir taux d'occupation, revenus du mois, impayés, baux expirants, graphique évolution.

- [ ] T043 [US5] Créer `src/actions/dashboard.ts` — Server Actions selon `contracts/dashboard.md` :
  - `getDashboardStats()` : taux occupation, finances mois courant, alertes
  - `getRevenusEvolution(periode)` : données pour graphique mensuel
- [ ] T044 [P] [US5] Créer `src/components/charts/revenus-chart.tsx` :
  - Graphique en barres (Recharts) : revenus encaissés vs attendus par mois
  - Sélecteur de période (3, 6, 12 mois)
- [ ] T045 [P] [US5] Créer les composants cards du dashboard dans `src/components/` :
  - `stat-card.tsx` : carte avec icône, titre, valeur, variation (réutilisable)
  - `alertes-card.tsx` : liste des alertes (baux expirants, impayés)
  - `occupation-gauge.tsx` : jauge visuelle du taux d'occupation
- [ ] T046 [US5] Créer `src/app/(gestionnaire)/dashboard/page.tsx` :
  - Grille de stat-cards : Appartements occupés, Revenus du mois, Impayés, Baux actifs
  - Section alertes (baux expirants dans 30 jours, locataires avec impayés)
  - Graphique évolution des revenus
  - Sélecteur de période pour le graphique

**Checkpoint**: Tableau de bord complet avec données en temps réel.

---

## Phase 9: User Story 6 — Portail locataire (Priority: P3) 🏠👤

**Goal**: Espace personnel pour chaque locataire.

**Independent Test**: Un locataire se connecte et voit son bail, ses paiements, son solde.

- [ ] T047 [US6] Créer `src/actions/portail-locataire.ts` — Server Actions :
  - `getMonEspace()` : infos du locataire connecté (appartement, bail actif, prochain loyer)
  - `getMonHistoriquePaiements()` : liste des paiements du locataire
  - `getMonBail()` : détails du bail actif
- [ ] T048 [US6] Créer `src/app/(locataire)/mon-espace/page.tsx` :
  - Card résumé : appartement, loyer, prochain paiement dû, solde
  - Derniers paiements (3 derniers)
  - Lien vers bail et historique complet
- [ ] T049 [US6] Créer `src/app/(locataire)/mon-espace/bail/page.tsx` :
  - Détails du bail : dates, loyer, caution, statut
- [ ] T050 [US6] Créer `src/app/(locataire)/mon-espace/paiements/page.tsx` :
  - Historique complet des paiements avec statuts
  - Mois impayés clairement identifiés

**Checkpoint**: Portail locataire fonctionnel et accessible.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Finitions et améliorations transversales

- [ ] T051 [P] Responsive design — vérifier et ajuster toutes les pages sur mobile (< 640px)
- [ ] T052 [P] Créer `src/app/loading.tsx` et loading states pour chaque page (skeletons)
- [ ] T053 [P] Créer `src/app/error.tsx` et `src/app/not-found.tsx` — pages d'erreur personnalisées
- [ ] T054 Ajouter les toasts de confirmation/erreur sur toutes les actions (création, modification, suppression)
- [ ] T055 [P] Créer le `README.md` du projet avec :
  - Description de l'application
  - Stack technique
  - Instructions d'installation et de démarrage
  - Variables d'environnement requises
  - Commandes utiles (seed, migration, dev)
- [ ] T056 Optimisation des requêtes Prisma (select/include ciblés, pas de N+1)
- [ ] T057 [P] Ajouter les meta tags SEO et favicon/logo LokaGest

**Checkpoint**: Application complète, polie, prête pour la production.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Aucune dépendance — démarrage immédiat
- **Phase 2 (Foundational)**: Dépend de Phase 1 — **BLOQUE toutes les User Stories**
- **Phase 3 (Auth)**: Dépend de Phase 2 — peut démarrer en premier
- **Phases 4-5 (Appartements + Locataires)**: Dépendent de Phase 2+3 — peuvent être parallélisées
- **Phase 6 (Baux)**: Dépend de Phases 4+5 (nécessite appartements et locataires)
- **Phase 7 (Paiements)**: Dépend de Phase 6 (nécessite les baux)
- **Phase 8 (Dashboard)**: Dépend de Phases 4+5+6+7 (agrège toutes les données)
- **Phase 9 (Portail locataire)**: Dépend de Phases 5+6+7 (données locataire)
- **Phase 10 (Polish)**: Dépend de toutes les phases précédentes

### Ordre d'exécution recommandé

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 + Phase 5 (parallèle)
                                    ↓
                               Phase 6 → Phase 7 → Phase 8
                                              ↓
                                         Phase 9 → Phase 10
```

### Parallel Opportunities

- T003 + T004 + T005 (setup)
- T009 + T010 (foundational)
- T015 + T016 (layouts)
- T021 + T022 (composants appartements)
- T027 + T028 (composants locataires)
- T033 + T034 (composants baux)
- T039 + T040 (composants paiements)
- T044 + T045 (composants dashboard)
- T051 + T052 + T053 + T055 + T057 (polish)

---

## Implementation Strategy

### MVP First (User Stories P1 uniquement)

1. Phase 1 + 2 : Setup + Foundation
2. Phase 3 : Auth
3. Phase 4 : Appartements
4. Phase 5 : Locataires
5. Phase 7 : Paiements
6. **STOP et VALIDER** : MVP fonctionnel avec gestion de base

### Livraison complète

7. Phase 6 : Baux
8. Phase 8 : Dashboard
9. Phase 9 : Portail locataire
10. Phase 10 : Polish

---

## Notes

- Tous les montants sont en FCFA, formatés avec `formatFCFA()` de `src/lib/utils.ts`
- L'interface est entièrement en français
- Les Server Actions Next.js remplacent une API REST — pas besoin de routes `/api/`
- Chaque Server Action utilise `revalidatePath()` pour rafraîchir les données après mutation
- Les formulaires utilisent `useFormState` + `useFormStatus` pour le feedback utilisateur
