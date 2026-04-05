# ImmoGest — Application de Gestion Locative

Application web de gestion des locataires, baux et loyers pour **IMMOSTAR SCI** (Yaoundé, Nkolfoulou).

## Stack technique
- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript** + **Tailwind CSS** + **shadcn/ui**
- **PostgreSQL** + **Prisma 6**
- **NextAuth.js v5** (email/mot de passe, rôles)
- **Recharts** (graphiques dashboard)
- **Nodemailer** (emails automatiques)

## Démarrage local

```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

## Variables d'environnement

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="votre-secret"
NEXTAUTH_URL="https://votre-domaine.vercel.app"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="email@gmail.com"
SMTP_PASS="mot-de-passe-app"
SMTP_FROM="ImmoGest <email@gmail.com>"
```

## Identifiants par défaut
- Gestionnaire : `admin@immostar.cm` / `admin123`
- Locataire test : `paul.mbarga@email.cm` / `locataire123`
