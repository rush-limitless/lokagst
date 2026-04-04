# Data Model: LokaGest

**Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Entity Relationship Diagram (textuel)

```
Utilisateur (1) ──── (0..1) Locataire
Locataire   (1) ──── (0..1) Appartement  [locataire actif]
Locataire   (1) ──── (1..*) Bail
Appartement (1) ──── (0..*) Bail
Bail        (1) ──── (0..*) Paiement
```

## Schéma Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// UTILISATEUR — Authentification et rôles
// ============================================================
model Utilisateur {
  id            String   @id @default(cuid())
  email         String   @unique
  motDePasse    String   // hashé avec bcrypt
  role          Role     @default(LOCATAIRE)
  statut        StatutUtilisateur @default(ACTIF)
  tentativesEchouees Int @default(0)
  bloqueJusqua  DateTime?
  locataireId   String?  @unique
  locataire     Locataire? @relation(fields: [locataireId], references: [id])
  creeLe        DateTime @default(now())
  misAJourLe    DateTime @updatedAt

  @@map("utilisateurs")
}

enum Role {
  GESTIONNAIRE
  LOCATAIRE
}

enum StatutUtilisateur {
  ACTIF
  BLOQUE
}

// ============================================================
// APPARTEMENT — Unités locatives de l'immeuble
// ============================================================
model Appartement {
  id          String   @id @default(cuid())
  numero      String   @unique  // ex: "A1", "B3"
  etage       Etage
  type        TypeAppartement
  loyerBase   Int      // en FCFA
  description String?
  statut      StatutAppartement @default(LIBRE)
  baux        Bail[]
  creeLe      DateTime @default(now())
  misAJourLe  DateTime @updatedAt

  @@map("appartements")
}

enum Etage {
  RDC
  PREMIER
  DEUXIEME
  TROISIEME
  QUATRIEME
}

enum TypeAppartement {
  STUDIO
  T2
  T3
  T4
}

enum StatutAppartement {
  LIBRE
  OCCUPE
}

// ============================================================
// LOCATAIRE — Personnes louant un appartement
// ============================================================
model Locataire {
  id            String   @id @default(cuid())
  nom           String
  prenom        String
  telephone     String
  email         String?  @unique
  numeroCNI     String?
  photo         String?  // URL de la photo
  statut        StatutLocataire @default(ACTIF)
  dateEntree    DateTime
  dateSortie    DateTime?
  baux          Bail[]
  utilisateur   Utilisateur?
  creeLe        DateTime @default(now())
  misAJourLe    DateTime @updatedAt

  @@map("locataires")
}

enum StatutLocataire {
  ACTIF
  ARCHIVE
}

// ============================================================
// BAIL — Contrat de location
// ============================================================
model Bail {
  id              String   @id @default(cuid())
  locataireId     String
  locataire       Locataire @relation(fields: [locataireId], references: [id])
  appartementId   String
  appartement     Appartement @relation(fields: [appartementId], references: [id])
  dateDebut       DateTime
  dureeMois       Int      // durée en mois
  dateFin         DateTime // calculée: dateDebut + dureeMois
  montantLoyer    Int      // en FCFA
  montantCaution  Int      // en FCFA
  statut          StatutBail @default(ACTIF)
  paiements       Paiement[]
  creeLe          DateTime @default(now())
  misAJourLe      DateTime @updatedAt

  @@map("baux")
}

enum StatutBail {
  ACTIF
  RESILIE
  TERMINE
  EXPIRE
}

// ============================================================
// PAIEMENT — Enregistrement des loyers payés
// ============================================================
model Paiement {
  id              String   @id @default(cuid())
  bailId          String
  bail            Bail     @relation(fields: [bailId], references: [id])
  montant         Int      // en FCFA
  moisConcerne    DateTime // premier jour du mois concerné
  datePaiement    DateTime @default(now())
  modePaiement    ModePaiement
  statut          StatutPaiement @default(PAYE)
  resteDu         Int      @default(0) // en FCFA, > 0 si paiement partiel
  notes           String?
  creeLe          DateTime @default(now())

  @@unique([bailId, moisConcerne]) // un seul enregistrement par mois par bail
  @@map("paiements")
}

enum ModePaiement {
  ESPECES
  MOBILE_MONEY
  VIREMENT
}

enum StatutPaiement {
  PAYE
  PARTIELLEMENT_PAYE
}
```

## Règles métier sur les données

1. **Appartement.statut** est mis à jour automatiquement :
   - Passe à `OCCUPE` quand un bail `ACTIF` existe pour cet appartement.
   - Repasse à `LIBRE` quand le bail est résilié/terminé et qu'aucun autre bail actif n'existe.

2. **Bail.dateFin** est calculée automatiquement : `dateDebut + dureeMois`.

3. **Paiement.resteDu** = `bail.montantLoyer - paiement.montant` si paiement partiel.

4. **Locataire.statut** passe à `ARCHIVE` quand son dernier bail est résilié/terminé.

5. **Utilisateur.tentativesEchouees** est incrémenté à chaque échec de connexion. À 5 tentatives, `bloqueJusqua` est défini à `now() + 15 minutes`.

6. **Contrainte d'unicité** : Un seul paiement par mois par bail (`@@unique([bailId, moisConcerne])`). Les paiements partiels sont mis à jour, pas dupliqués.

7. **Soft delete** : Les locataires ne sont jamais supprimés, ils passent en statut `ARCHIVE`.
