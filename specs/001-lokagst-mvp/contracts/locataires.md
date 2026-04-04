# API Contract: Locataires

## Server Actions

### `getLocataires(filters?)`
**File**: `src/actions/locataires.ts`

**Input**:
```typescript
{
  recherche?: string        // Recherche nom/prénom
  statut?: StatutLocataire  // ACTIF ou ARCHIVE
}
```

**Output**:
```typescript
{
  locataires: {
    id: string
    nom: string
    prenom: string
    telephone: string
    email: string | null
    statut: StatutLocataire
    appartement?: { numero: string, etage: Etage } | null
    impayesMois: number  // nombre de mois d'impayés
  }[]
  total: number
}
```

### `getLocataire(id)`
**Output**: Locataire complet avec baux et historique paiements.

### `creerLocataire(data)`
**Input**:
```typescript
{
  nom: string             // Requis
  prenom: string          // Requis
  telephone: string       // Requis
  email?: string          // Optionnel, unique si fourni
  numeroCNI?: string
  photo?: string
  appartementId: string   // Requis — doit être un appartement LIBRE
  dateEntree: Date        // Requis
}
```
**Règle**: L'appartement doit être LIBRE. Après création, l'appartement passe à OCCUPE.
**Validation Zod**: nom et prénom non vides, téléphone format camerounais (6XXXXXXXX).

### `modifierLocataire(id, data)`
**Input**: Champs modifiables (pas l'appartement — changement via nouveau bail).

### `archiverLocataire(id)`
**Règle**: Le locataire passe en ARCHIVE. Son bail actif est résilié. L'appartement repasse en LIBRE.
