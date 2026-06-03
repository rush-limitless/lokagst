# Vibe Coding Guide — ImmoGest (IMMOSTAR SCI)

## Commencer une session

1. Ouvrir le terminal dans `/home/f2g/lokagst`
2. Lancer `kiro chat`
3. Le contexte est auto-chargé depuis `/home/f2g/Contexte .md/ImmoGest/Immo_contexte_v4.md`

## Structure du projet

```
~/lokagst/
├── prisma/schema.prisma          ← Modèles de données
├── src/
│   ├── actions/                  ← Server Actions (33 fichiers)
│   ├── app/(gestionnaire)/       ← Pages admin
│   ├── app/(locataire)/          ← Portail locataire
│   ├── app/api/cron/             ← Jobs planifiés
│   ├── components/               ← Composants UI
│   ├── lib/                      ← Modules métier
│   │   ├── auth.ts               ← Config NextAuth
│   │   ├── auth-guard.ts         ← requireGestionnaire/requireAuth
│   │   ├── calculs-loyer.ts      ← Formule attendu multi-baux
│   │   ├── cron-tasks.ts         ← Logique cron (rappels, pénalités, renouvellements)
│   │   ├── rate-limit.ts         ← Rate limiter
│   │   ├── utils.ts              ← isMoisEcheance, PERIODICITE_MOIS
│   │   └── whatsapp.ts           ← Meta Cloud API
│   └── __tests__/                ← Tests Vitest
├── next.config.mjs               ← Config (Sentry, PWA, headers)
└── vitest.config.ts              ← Config tests
```

## Commandes essentielles

```bash
# Build (fait toujours avant push)
npx prisma generate && npx next build

# Tests
npm run test:run

# Accès DB production
vercel env pull .env.vercel
# Puis utiliser: PGPASSWORD="npg_Eqsy2XNrZ5Pk" psql "postgresql://neondb_owner@ep-quiet-shadow-anesplbn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Migration schema → prod
DATABASE_URL="postgresql://neondb_owner:npg_Eqsy2XNrZ5Pk@ep-quiet-shadow-anesplbn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require" npx prisma db push

# Déployer
git add -A && git commit -m "message" && git push
# → Vercel auto-deploy depuis main
```

## Conventions du projet

- **Langue code** : commentaires en français, variables/fonctions en anglais/camelCase
- **Server Actions** : toujours `await requireGestionnaire()` en première ligne
- **Calcul attendu** : `calculerAttenduMultiBaux()` dans `src/lib/calculs-loyer.ts`
- **Nouveaux modules** : dans `src/lib/` (pas dans actions/)
- **UI** : shadcn/ui + Tailwind, pas d'emojis dans l'UI (icônes Lucide)
- **Exports Excel** : dynamic import `await import("xlsx-js-style")`
- **Tables DB** : snake_case, colonnes camelCase
- **Périodicité** : MENSUEL(1), TRIMESTRIEL(3), SEMESTRIEL(6), ANNUEL(12)

## Retours boss — Template

Quand la boss envoie des retours :
1. Copier-coller le message exact
2. Si c'est un screenshot → `/home/f2g/Pictures/retours/`
3. Si c'est un fichier Excel → comparer avec `/home/f2g/Pictures/azer/TABLEAU DE SUIVI...xlsx`
4. Toujours vérifier la formule Excel du boss : `attendu = (loyer+charges) × (jours/30)`

## Checklist avant push

- [ ] `npx next build` passe (✓ Compiled successfully)
- [ ] Pas de variables inutilisées (ESLint les bloque)
- [ ] Pas de secrets dans les fichiers commités
- [ ] Si nouveau champ DB → `prisma db push` sur Neon
- [ ] Si touche aux calculs → `npm run test:run`

## Pièges connus

| Piège | Solution |
|-------|----------|
| Build fail "unused variable" | Supprimer ou préfixer avec `_` |
| DB locale vide | Toujours tester sur Neon prod |
| Mot de passe Neon changé | `vercel env pull .env.vercel` |
| xlsx-js-style dans le bundle | Toujours `await import()`, jamais `import XLSX from...` |
| Bail EXPIRE jamais re-traité | Le cron ne re-touche pas aux baux EXPIRE → fix manuelle sur Neon |
| Session déconnexion | JWT 8h + inactivité 2h avec compte à rebours 60s |

## Fichiers de référence

- **Contexte projet** : `~/Contexte .md/ImmoGest/Immo_contexte_v4.md`
- **Sessions** : `~/Sessions Kiro/session_immogest_*.md`
- **Excel boss** : `~/Pictures/azer/TABLEAU DE SUIVI SIMPLIFIE...xlsx`
- **Retours boss** : `~/Pictures/retours/`
- **Guide utilisateur** : `~/lokagst/docs/guide-utilisateur.pdf`

## Sauvegarder une session

En fin de session, dire : "save le contexte"
→ Met à jour `Immo_contexte_v4.md` + crée un fichier session dans `~/Sessions Kiro/`
