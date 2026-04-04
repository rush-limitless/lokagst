# API Contract: Appartements

## Server Actions

### `getAppartements(filters?)`
**File**: `src/actions/appartements.ts`

**Input**:
```typescript
{
  etage?: Etage           // Filtrer par étage
  statut?: StatutAppartement  // Filtrer par statut
  recherche?: string      // Recherche par numéro
}
```

**Output**:
```typescript
{
  appartements: {
    id: string
    numero: string
    etage: Etage
    type: TypeAppartement
    loyerBase: number
    description: string | null
    statut: StatutAppartement
    locataireActuel?: { nom: string, prenom: string } | null
  }[]
  total: number
}
```

### `getAppartement(id)`
**Output**: Appartement complet avec historique des baux.

### `creerAppartement(data)`
**Input**:
```typescript
{
  numero: string          // Requis, unique
  etage: Etage            // Requis
  type: TypeAppartement   // Requis
  loyerBase: number       // Requis, > 0
  description?: string
}
```
**Validation Zod**: numero non vide, loyerBase > 0, etage et type valides.
**Output**: `{ success: true, appartement: Appartement }` ou `{ success: false, error: string }`

### `modifierAppartement(id, data)`
**Input**: Mêmes champs que `creerAppartement`, tous optionnels.
**Règle**: Si un bail actif existe, le loyerBase peut être modifié mais ne s'appliquera qu'au prochain bail.

### `supprimerAppartement(id)`
**Règle**: Impossible si un bail actif existe. Retourne une erreur explicite.
