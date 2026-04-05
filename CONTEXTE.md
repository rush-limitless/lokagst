# ImmoGest — Contexte projet

## Projet
- **App** : ImmoGest — Application de gestion locative pour IMMOSTAR SCI
- **Boss** : Propriétaire d'un immeuble R+4 à Yaoundé, Nkolfoulou (Résidence La'ag Tchang)
- **Développeur** : Arnaud CHEWA
- **Repo** : https://github.com/rush-limitless/lokagst
- **Déployé** : Vercel (auto-deploy depuis GitHub)
- **Base de données** : Neon PostgreSQL
- **Admin** : admin@immostar.cm / admin123

## Stack technique
- Next.js 14 (App Router, Server Components, Server Actions)
- TypeScript, Tailwind CSS, shadcn/ui
- Prisma 6 + PostgreSQL (Neon)
- NextAuth v5 (credentials, JWT, rôles)
- Recharts, Nodemailer, xlsx-js-style

## Fonctionnalités implémentées (v4.5)
- Auth avec rôles (gestionnaire/locataire) + blocage 5 tentatives
- Dashboard glassmorphism avec graphiques, stats, activité récente, notifications
- CRUD Appartements (cards visuelles, recherche, filtres)
- CRUD Locataires (photo, garant, notes, avatar gradient, recherche)
- Baux complets (tous termes contrat, charges, périodicité mensuel/trimestriel/semestriel/annuel, règle du 15, signature électronique, upload contrat, état des lieux)
- Paiements (virement bancaire / Orange Money uniquement, preuve de paiement, validation/rejet, reçus PDF, quittances)
- Maintenance (gestionnaire + locataire, photos, suivi statut)
- Messagerie intégrée (chat temps réel)
- Emails automatiques (factures mensuelles, rappels, mises en demeure, reçus, rapport mensuel)
- Cron quotidien (rappels, pénalités, suspensions, renouvellements auto)
- Reporting complet (Excel coloré 5 onglets format IMMOSTAR, PDF, CSV, bilan impayés, cautions, classement, rentabilité, comparaison périodes)
- Multi-immeubles, Audit log, Mode sombre, PWA, Multi-langues FR/EN
- Portail locataire (accueil bancaire, bail, paiements, maintenance, messagerie, signature, paramètres)
- Design premium (charte IMMOSTAR bleu ciel/foncé, logo partout, animations, glassmorphism)

## Données réelles
- 29 appartements, 29 locataires actifs, 753 paiements historiques
- Données issues du fichier Excel IMMOSTAR fourni par le boss

## Fichiers importants
- ~/lokagst/ — code source
- ~/projet_wifi_zone_finstar.pdf — document WiFi Zone (autre projet)
- ~/Pictures/Immo/ — logo IMMOSTAR SCI
- ~/Pictures/Immo/reporting/ — fichier Excel de référence pour le reporting

## SMTP configuré
- Gmail : arnaudchewa65@gmail.com (mot de passe d'application sur Vercel)

## Ce qui reste à faire (nice to have)
- Intégration SMS (Twilio)
- Intégration API Orange Money
- Capacitor pour Play Store
- Notification sonore messagerie
