# API Contract: Dashboard

## Server Actions

### `getDashboardStats()`
**File**: `src/actions/dashboard.ts`

**Output**:
```typescript
{
  appartements: {
    total: number
    occupes: number
    libres: number
    tauxOccupation: number  // pourcentage
  }
  finances: {
    revenusMoisCourant: number    // FCFA
    impayesMoisCourant: number    // FCFA
    revenusAttendusMois: number   // FCFA (somme des loyers actifs)
  }
  alertes: {
    bauxExpirants: {              // baux expirant dans 30 jours
      bailId: string
      locataire: string
      appartement: string
      dateFin: Date
      joursRestants: number
    }[]
    impayesLocataires: {          // locataires avec impayés
      locataireId: string
      nom: string
      moisImpayes: number
      montantDu: number
    }[]
  }
}
```

### `getRevenusEvolution(periode)`
**Input**: `{ mois: number }` — nombre de mois en arrière (défaut: 6)
**Output**:
```typescript
{
  evolution: {
    mois: string        // "Avril 2026"
    revenus: number     // FCFA encaissés
    attendus: number    // FCFA attendus
  }[]
}
```
