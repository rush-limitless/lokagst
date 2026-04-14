# ImmoGest — Contexte projet v2 (mis à jour 14/04/2026)

## Projet
- **App** : ImmoGest v1.0.0 — Application de gestion locative pour IMMOSTAR SCI
- **Boss** : Propriétaire de 2 immeubles à Yaoundé, Nkolfoulou
- **Développeur** : Arnaud CHEWA
- **Repo** : https://github.com/rush-limitless/lokagst
- **Déployé** : Vercel (auto-deploy depuis GitHub main)
- **Base de données** : Neon PostgreSQL
- **Super Admin** : admin@immostar.cm / admin123
- **Gestionnaires** : gestion1@immostar.cm / gestion123, gestion2@immostar.cm / gestion123

## Stack technique
- Next.js 14 (App Router, Server Components, Server Actions)
- TypeScript, Tailwind CSS, shadcn/ui
- Prisma 6 + PostgreSQL (Neon)
- NextAuth v5 (credentials, JWT, 3 rôles : SUPER_ADMIN / GESTIONNAIRE / LOCATAIRE)
- Recharts, Nodemailer, xlsx-js-style
- Session : 8h (JWT maxAge)

## 3 Rôles
- **SUPER_ADMIN** : accès complet + gestion des gestionnaires + voit TOUTES les actions dans l'audit
- **GESTIONNAIRE** : accès complet sauf gestion des gestionnaires + voit uniquement SES actions dans l'audit
- **LOCATAIRE** : portail personnel (bail, paiements, maintenance, messagerie)

## 2 Immeubles — 32 appartements
- **Résidence La'ag Tchang** : 30 logements (RDC à 5ème étage)
  - RDC : STUDIO B01, RDC GAB, RDC IT
  - 1er : APPART A11 (LIBRE), A12, B13, B14
  - 2ème : APPART A21, A22, B23, B24
  - 3ème : STUDIO A31, A32, B37, B38 + CHAMBRE A33, A34, B35, B36
  - 4ème : STUDIO A41, A42, B47, B48 + CHAMBRE B43, B44, B45, B46
  - 5ème : APPART MEUBLÉ (ponctuel) + SALLE DE CONFERENCE
- **Santa Barbara** : 2 appartements (RDC SB + ETAGE SB)
- 27 locataires actifs, 14 anciens locataires archivés
- ~660 paiements historiques

## Données spécifiques
- ATG 1 et ATG 2 : charges 15 000 FCFA chacun, 2 baux (ancien terminé, nouveau actif), caution passée de 300k à 450k
- IT (RDC) : charges 30 000 FCFA
- ONANA et MAMOUDOU (Santa Barbara) : charges 5 000 FCFA
- APPART MEUBLÉ (Étage 5) : location ponctuelle, pas de locataire fixe
- Paiements uniquement par Virement bancaire ou Orange Money
- Périodicité variable : mensuel, trimestriel, semestriel, annuel
- Règle du 15 : signature bail avant le 15 = 1er loyer ce mois, après = mois suivant
- Types logements : Studio, Chambre, Appartement, Studio meublé, Chambre meublée, Appartement meublé, Villa, Salle de conférence
- Étages : RDC, 1er à 5ème, Autre

## Navigation (Sidebar)
```
Principal:  Dashboard / Immeubles / Appartements / Locataires / Situation / Contrats
Finance:    Finances / Dépenses / Paiements / Calendrier
Communication: Maintenance / Messagerie
Admin:      Paramètres
```
Tous les menus sont traduits FR/EN via i18n.

## Fonctionnalités implémentées (v1.0.0)

### Authentification
- Login avec email/mot de passe, blocage après 5 tentatives (15 min)
- 3 rôles : SUPER_ADMIN, GESTIONNAIRE, LOCATAIRE
- Session JWT 8h
- Placeholders "Entrer adresse email" / "Entrer mot de passe"
- Sélecteur de langue FR/EN sur la page de connexion

### Dashboard
- Glassmorphism, mesh gradient, barre d'occupation
- 4 KPI : occupation, revenus du mois (loyers/charges/cautions), impayés (après jour limite), libres
- Graphique évolution revenus 6 mois (encaissés vs attendus)
- Camembert occupation
- Alertes : baux expirants 30j, impayés ce mois
- Activité récente
- Boutons rapides : Paiement, Bail, Locataire

### Immeubles
- Vue physique par étage (coupe du bâtiment)
- Cumulatif global en haut : total logements, occupés, libres, % occupation, revenu mensuel
- Chaque appartement cliquable avec statut, type, loyer, locataire
- Créer/modifier immeuble

### Appartements
- Classés par immeuble puis étage avec couleurs correspondantes
- Cards visuelles : numéro, étage, type, loyer, charges, statut, locataire
- Filtres : par immeuble, par statut (libre/occupé), recherche
- Détail : modifier, historique des baux (inclut anciens locataires), supprimer
- Types : Studio, Chambre, Appartement, meublés, Villa, Salle de conférence
- Étages : RDC à 5ème + Autre

### Locataires
- Classés par immeuble puis étage
- Compteurs actifs/anciens dans les filtres
- Colonne immeuble dans le tableau
- Profil avec 4 onglets : Situation, Informations, Baux, Paiements
- Création locataire + bail unifié (tous les champs bail optionnels, loyer par défaut = loyerBase)
- Prénom optionnel
- Créer/gérer/supprimer compte locataire (popup avec email+mdp+envoi par email)
- Archiver locataire (résilie bail, libère appartement)
- Supprimer locataire (cascade : baux, paiements, pénalités, EDL, messages, emails, compte)
- Documents : contrat, EDL, règlement intérieur (upload PDF)

### Locataires > Paiements (onglet)
- Filtre par année avec compteurs
- Sélection multiple + suppression batch avec popup confirmation
- Clic sur ligne → page détail /paiements/[id]
- Caution affichée uniquement pour l'année de début du bail
- Total : paiements + caution versée + total encaissé global

### Situation globale
- 5 KPI : total, à jour, en retard, loyers impayés, charges impayées
- Filtres : Tous / À jour / Impayés
- Mini-historique visuel 12 mois par locataire
- Bouton "🖨️ Facture des dettes" → page imprimable
- Facture individuelle par locataire (?locataire=id)
- Classé par immeuble puis étage

### Contrats / Baux
- Classés par immeuble puis étage avec compteurs
- Filtres : Tous, Actifs, Terminés, Résiliés
- Création bail complète : locataire, appartement, dates, loyer, caution, charges, périodicité, pénalités, renouvellement, clauses
- Détection bail existant → avertissement + confirmation avant remplacement
- Caution différentielle (ancien 300k → nouveau 450k = 150k à payer)
- Un seul bail ACTIF par locataire+appartement
- Renouvellement auto (sauf dénonciation 2 mois avant)
- Modifier bail : début, fin, loyer, charges, caution, renouvellement
- Indexer loyer : disponible uniquement pour baux ≥ 2 ans
- Supprimer bail avec popup confirmation (cascade paiements/pénalités/EDL)
- Contrat PDF, upload contrat scan
- État des lieux : pièces via liste déroulante (15 types), retirer pièces, photos, signatures, caution à rembourser (sortie)
- Temps dans l'appartement affiché
- Seuil mise en demeure expliqué
- Suspension retirée

### Paiements
- Enregistrement avec ventilation : loyer, charges, caution, autres
- Ventilation intelligente mois par mois : chaque mois rempli complètement avant le suivant
- Mois partiels existants complétés en priorité
- Pas de double paiement pour le même mois (vérification)
- Mois concerné = mois sélectionné (pas de décalage)
- Pénalité optionnelle : checkbox "Appliquer la pénalité de retard" lors de l'enregistrement
- Modifier paiement : popup avec total auto-calculé
- Supprimer paiement (individuel ou batch)
- Page détail /paiements/[id] : ventilation complète, locataire, immeuble, preuve, reçu, quittance
- Charges masquées si montant = 0
- Pré-rempli avec valeurs du bail si paiement à 0

### Finances (Tableau de bord financier)
- Sélecteur d'année
- 4 KPI gradient : total encaissé, impayés, taux recouvrement, cautions
- Détail : loyers/charges/cautions/autres (encaissés vs attendus)
- Graphiques barres : revenus mensuels par catégorie, encaissé vs impayé
- Répartition par mode de paiement
- Top impayés
- Sous-navigation vers Reporting (Synthèse ↔ Export ↔ Impayés ↔ Cautions ↔ Classement ↔ Rentabilité ↔ Comparaison)

### Reporting / Export
- Excel coloré (xlsx-js-style) : suivi paiements, statistiques, état contrats
- Classé par immeuble puis étage dans toutes les feuilles
- Colonnes : loyer, charges, caution, total perçu, différence
- Différence = loyer+charges payés vs attendus (mois en cours = dû, exclut caution)
- Période sélectionnée dans le nom du fichier et l'en-tête
- PDF imprimable avec même structure
- Sélecteur de période : mois, trimestre, semestre, année, tout

### Calendrier
- Vue mensuelle des échéances
- Code couleur : vert (payé), orange (partiel), rouge (impayé)

### Maintenance
- Tickets : titre, description, photos, priorité, statut
- Gestionnaire + locataire peuvent créer
- Suivi : Signalé → En cours → Résolu

### Messagerie
- Chat temps réel gestionnaire ↔ locataire
- Badge messages non lus

### Paramètres
- Changer mot de passe
- Gestion des gestionnaires (SUPER_ADMIN only) : ajouter, modifier, supprimer
- Raccourcis : Journal d'audit, Emails envoyés

### Audit (anti-fraude)
- Chaque action loguée avec rôle + email
- SUPER_ADMIN voit toutes les actions
- GESTIONNAIRE voit uniquement ses propres actions
- Lignes cliquables avec détails expandables
- Filtres par type d'action
- Paiements : audit auto à la création et suppression

### Portail locataire
- Accueil style bancaire : nom, appartement, loyer, jours restants, derniers paiements
- Mon bail : consultation complète, signature électronique
- Mes paiements : soumettre preuve, historique
- Maintenance : signaler problème, suivre statut
- Messagerie : chat avec la gestion
- Paramètres : changer mot de passe

### Transversal
- Recherche globale Cmd+K
- Mode sombre
- Multilingue FR/EN (sidebar traduite, i18n)
- Notifications (cloche)
- PWA installable
- Cron quotidien : rappels, pénalités, renouvellements auto
- Signature pad réduit (400×100)

## SMTP configuré
- Gmail : arnaudchewa65@gmail.com (mot de passe d'application sur Vercel)

## APIs de maintenance
- `/api/fix-5eme` : enums, salle conférence, comptes admin, nettoyage appartements orphelins
- `/api/fix-paiements` : corrige moisConcerne + supprime doublons
- `/api/fix-admin` : réinitialise compte admin
- `/api/fix-atg-line` : corrige ATG 1/2 et Line Essouka
- `/api/check-db` : vérifie l'état de la base
- `/api/gestionnaires` : CRUD gestionnaires (SUPER_ADMIN only)
- `/api/gerer-compte` : modifier/supprimer compte locataire
- `/api/send-credentials` : envoyer identifiants par email
- `/api/upload-reglement` : upload règlement intérieur

## Fichiers importants
- ~/lokagst/ — code source
- ~/Downloads/Immo_contexte.md — ancien contexte v1
- ~/lokagst/docs/guide-utilisateur.tex — guide LaTeX (18 pages)
- ~/lokagst/docs/guide-utilisateur.pdf — guide PDF compilé
- ~/Pictures/Immo/ — logo IMMOSTAR SCI
- ~/Pictures/Immo/reporting/ — fichiers Excel de référence

## Ce qui reste à faire (nice to have)
- Intégration SMS (Twilio)
- Intégration API Orange Money
- Capacitor pour Play Store
- Vue 3D des immeubles (besoin plans AutoCAD)
- Templates contrats/baux (besoin modèle type)
- Templates factures/reçus (besoin format souhaité)
- i18n complet de toutes les pages (sidebar fait, pages serveur à faire)
