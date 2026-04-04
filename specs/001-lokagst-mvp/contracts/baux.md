# API Contract: Baux

## Server Actions

### `getBaux(filters?)`
**File**: `src/actions/baux.ts`

**Input**:
```typescript
{
  statut?: StatutBail
  expirantDans?: number   // jours — baux expirant dans N jours
}
```

**Output**:
```typescript
{
  baux: {
    id: string
    locataire: { nom: string, prenom: string }
    appartement: { numero: string, etage: Etage }
    dateDebut: Date
    dateFin: Date
    montantLoyer: number
    montantCaution: number
    statut: StatutBail
    joursRestants: number
  }[]
  total: number
}
```

### `creerBail(data)`
**Input**:
```typescript
{
  locataireId: string
  appartementId: string
  dateDebut: Date
  dureeMois: number       // > 0
  montantLoyer: number    // > 0
  montantCaution: number  // >= 0
}
```
**Règle**: `dateFin` calculée automatiquement. L'appartement doit être LIBRE (ou le locataire doit déjà y être).

### `resilierBail(id)`
**Règle**: Statut passe à RESILIE. Appartement repasse à LIBRE. Locataire archivé si pas d'autre bail actif.

### `renouvelerBail(id, data)`
**Input**: `{ dureeMois: number, montantLoyer?: number }`
**Règle**: L'ancien bail passe à TERMINE. Un nouveau bail est créé avec dateDebut = ancienne dateFin.
