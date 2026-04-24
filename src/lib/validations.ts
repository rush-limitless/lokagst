import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(6, "Minimum 6 caractères"),
});

export const appartementSchema = z.object({
  numero: z.string().min(1, "Numéro requis"),
  etage: z.enum(["RDC", "PREMIER", "DEUXIEME", "TROISIEME", "QUATRIEME", "CINQUIEME", "AUTRE"]),
  type: z.enum(["STUDIO", "CHAMBRE", "APPARTEMENT", "STUDIO_MEUBLE", "CHAMBRE_MEUBLE", "APPARTEMENT_MEUBLE", "VILLA", "SALLE_CONFERENCE"]),
  loyerBase: z.coerce.number().int().positive("Le loyer doit être positif"),
  description: z.string().optional(),
});

export const locataireSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().optional().default(""),
  telephone: z.string().regex(/^6\d{8}$/, "Format: 6XXXXXXXX"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  numeroCNI: z.string().optional(),
  photo: z.string().optional(),
  appartementId: z.string().min(1, "Appartement requis"),
  dateEntree: z.coerce.date(),
});

export const bailSchema = z.object({
  locataireId: z.string().min(1, "Locataire requis"),
  appartementId: z.string().min(1, "Appartement requis"),
  dateDebut: z.coerce.date(),
  dureeMois: z.coerce.number().int().positive("Durée requise"),
  montantLoyer: z.coerce.number().int().positive("Loyer requis"),
  montantCaution: z.coerce.number().int().min(0, "Caution invalide"),
  periodicite: z.enum(["JOURNALIER", "MENSUEL", "TRIMESTRIEL", "SEMESTRIEL", "ANNUEL", "NON_APPLICABLE"]).default("MENSUEL"),
  chargesLocatives: z.string().optional(),
  impotsTaxes: z.string().optional(),
  jourLimitePaiement: z.coerce.number().int().min(1).max(28).default(5),
  delaiGrace: z.coerce.number().int().min(0).default(5),
  penaliteType: z.enum(["POURCENTAGE", "MONTANT_FIXE"]).default("POURCENTAGE"),
  penaliteMontant: z.coerce.number().int().min(0).default(5),
  penaliteRecurrente: z.coerce.boolean().default(false),
  renouvellementAuto: z.coerce.boolean().default(false),
  dureeRenouvellement: z.coerce.number().int().optional(),
  augmentationLoyer: z.coerce.number().int().optional(),
  preavisNonRenouv: z.coerce.number().int().default(30),
  preavisResiliation: z.coerce.number().int().default(30),
  seuilMiseEnDemeure: z.coerce.number().int().default(2),
  seuilSuspension: z.coerce.number().int().default(3),
  clausesParticulieres: z.string().optional(),
});

export const paiementSchema = z.object({
  bailId: z.string().min(1, "Bail requis"),
  montant: z.coerce.number().int().positive("Montant requis"),
  montantLoyer: z.coerce.number().int().min(0).default(0),
  montantCharges: z.coerce.number().int().min(0).default(0),
  montantCaution: z.coerce.number().int().min(0).default(0),
  montantAutres: z.coerce.number().int().min(0).default(0),
  notesAutres: z.string().optional(),
  moisConcerne: z.coerce.date(),
  nbMois: z.coerce.number().int().min(1).default(1),
  modePaiement: z.enum(["VIREMENT_BANCAIRE", "ORANGE_MONEY"]),
  preuvePaiement: z.string().optional(),
  notes: z.string().optional(),
});
