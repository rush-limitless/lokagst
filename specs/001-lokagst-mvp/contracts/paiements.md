# API Contract: Paiements

## Server Actions

### `getPaiements(filters?)`
**File**: `src/actions/paiements.ts`

**Input**:
```typescript
{
  bailId?: string
  locataireId?: string
  moisDebut?: Date
  moisFin?: Date
}
```

**Output**:
```typescript
{
  paiements: {
    id: string
    locataire: { nom: string, prenom: string }
    appartement: { numero: string }
    montant: number
    moisConcerne: Date
    datePaiement: Date
    modePaiement: ModePaiement
    statut: StatutPaiement
    resteDu: number
    notes: string | null
  }[]
  total: number
  totalMontant: number
}
```

### `enregistrerPaiement(data)`
**Input**:
```typescript
{
  bailId: string
  montant: number           // > 0
  moisConcerne: Date        // premier jour du mois
  modePaiement: ModePaiement
  notes?: string
}
```
**Règles**:
- Si `montant < bail.montantLoyer` → statut = PARTIELLEMENT_PAYE, resteDu = loyer - montant.
- Si `montant >= bail.montantLoyer` → statut = PAYE, resteDu = 0.
- Si `montant > bail.montantLoyer` → surplus reporté comme avance (note automatique).
- Si un paiement existe déjà pour ce mois → mise à jour du montant (cumul).

### `getImpayesParLocataire()`
**Output**:
```typescript
{
  impayes: {
    locataireId: string
    nom: string
    prenom: string
    appartement: string
    moisImpayes: number
    montantTotal: number
  }[]
}
```
