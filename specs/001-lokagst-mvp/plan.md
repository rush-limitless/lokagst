# Implementation Plan: LokaGest

**Branch**: `001-lokagst-mvp` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)

## Summary

LokaGest est une application web de gestion locative pour l'entreprise FINSTAR. Elle permet au gestionnaire de gérer les appartements, locataires, baux et paiements d'un immeuble R+4 à Yaoundé, et offre un portail en lecture seule aux locataires. Stack choisie : Next.js 14 (App Router) + PostgreSQL + Prisma + NextAuth.js + Tailwind CSS + shadcn/ui.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS
**Framework**: Next.js 14 (App Router, Server Components, Server Actions)
**Primary Dependencies**:
  - **UI**: Tailwind CSS 3.x + shadcn/ui (composants accessibles, professionnels)
  - **ORM**: Prisma 5.x (type-safe, migrations, seeding)
  - **Auth**: NextAuth.js v5 (credentials provider, JWT sessions, rôles)
  - **Charts**: Recharts (graphiques dashboard)
  - **Validation**: Zod (validation côté serveur et client)
  - **Formatage monétaire**: Intl.NumberFormat (FCFA natif)
**Storage**: PostgreSQL 16 (robuste, gratuit, excellent pour les données relationnelles)
**Testing**: Vitest + Testing Library (si tests demandés)
**Target Platform**: Web (responsive mobile + desktop)
**Project Type**: Web application (fullstack monorepo Next.js)
**Performance Goals**: Chargement dashboard < 3s, enregistrement paiement < 1s
**Constraints**: Interface en français, montants en FCFA, responsive mobile
**Scale/Scope**: < 50 appartements, < 100 locataires, 1 gestionnaire, ~50 utilisateurs max

## Justification des choix techniques

### Pourquoi Next.js 14 ?
- **Fullstack** : Frontend + API dans un seul projet (pas besoin de backend séparé)
- **Server Components** : Rendu côté serveur performant, moins de JavaScript côté client
- **Server Actions** : Mutations de données sans API REST explicite
- **App Router** : Routing basé sur les fichiers, layouts imbriqués, loading states natifs

### Pourquoi PostgreSQL + Prisma ?
- **PostgreSQL** : Base relationnelle robuste, parfaite pour les données structurées (baux, paiements)
- **Prisma** : ORM type-safe avec TypeScript, migrations automatiques, excellent DX

### Pourquoi shadcn/ui + Tailwind ?
- **shadcn/ui** : Composants professionnels, accessibles, personnalisables (pas une dépendance npm, code copié dans le projet)
- **Tailwind** : Styling rapide, responsive natif, design system cohérent

### Pourquoi NextAuth.js ?
- **Intégré à Next.js** : Gestion de sessions, middleware de protection des routes
- **Credentials provider** : Email/mot de passe simple, pas besoin d'OAuth pour ce cas

## Project Structure

### Documentation (this feature)

```text
specs/001-lokagst-mvp/
├── spec.md              # Spécification fonctionnelle
├── plan.md              # Ce fichier
├── data-model.md        # Modèle de données
├── contracts/           # Contrats API
│   ├── appartements.md
│   ├── locataires.md
│   ├── baux.md
│   ├── paiements.md
│   └── dashboard.md
└── tasks.md             # Liste des tâches
```

### Source Code (repository root)

```text
lokagst/
├── prisma/
│   ├── schema.prisma        # Schéma de la base de données
│   ├── seed.ts              # Données de test
│   └── migrations/          # Migrations auto-générées
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Layout racine (providers, fonts, metadata)
│   │   ├── page.tsx             # Redirect vers /dashboard ou /login
│   │   ├── login/
│   │   │   └── page.tsx         # Page de connexion
│   │   ├── (gestionnaire)/      # Route group — layout gestionnaire
│   │   │   ├── layout.tsx       # Sidebar + header gestionnaire
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Tableau de bord
│   │   │   ├── appartements/
│   │   │   │   ├── page.tsx     # Liste des appartements
│   │   │   │   ├── nouveau/
│   │   │   │   │   └── page.tsx # Formulaire ajout
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Détail/modification
│   │   │   ├── locataires/
│   │   │   │   ├── page.tsx     # Liste des locataires
│   │   │   │   ├── nouveau/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── baux/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nouveau/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── paiements/
│   │   │       ├── page.tsx
│   │   │       └── nouveau/
│   │   │           └── page.tsx
│   │   └── (locataire)/         # Route group — layout locataire
│   │       ├── layout.tsx       # Layout simplifié locataire
│   │       └── mon-espace/
│   │           ├── page.tsx     # Dashboard locataire
│   │           ├── bail/
│   │           │   └── page.tsx
│   │           └── paiements/
│   │               └── page.tsx
│   ├── components/
│   │   ├── ui/                  # Composants shadcn/ui
│   │   ├── forms/               # Formulaires réutilisables
│   │   ├── tables/              # Tableaux de données
│   │   └── charts/              # Graphiques dashboard
│   ├── lib/
│   │   ├── prisma.ts            # Client Prisma singleton
│   │   ├── auth.ts              # Configuration NextAuth
│   │   ├── utils.ts             # Utilitaires (formatage FCFA, dates)
│   │   └── validations.ts      # Schémas Zod
│   ├── actions/
│   │   ├── appartements.ts     # Server Actions appartements
│   │   ├── locataires.ts       # Server Actions locataires
│   │   ├── baux.ts             # Server Actions baux
│   │   ├── paiements.ts        # Server Actions paiements
│   │   └── auth.ts             # Server Actions auth
│   └── types/
│       └── index.ts             # Types TypeScript partagés
├── public/
│   └── logo.png                 # Logo LokaGest
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── .env.local                   # Variables d'environnement
└── README.md
```

**Structure Decision**: Monorepo Next.js fullstack avec App Router. Les Server Actions remplacent une API REST classique, simplifiant l'architecture. Les route groups `(gestionnaire)` et `(locataire)` séparent les layouts par rôle.
