import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(6, "Minimum 6 caractères"),
});

export const appartementSchema = z.object({
  numero: z.string().min(1, "Numéro requis"),
  etage: z.enum(["RDC", "PREMIER", "DEUXIEME", "TROISIEME", "QUATRIEME"]),
  type: z.enum(["STUDIO", "T2", "T3", "T4"]),
  loyerBase: z.coerce.number().int().positive("Le loyer doit être positif"),
  description: z.string().optional(),
});

export const locataireSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  telephone: z.string().regex(/^6\d{8}$/, "Format: 6XXXXXXXX"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  numeroCNI: z.string().optional(),
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
});

export const paiementSchema = z.object({
  bailId: z.string().min(1, "Bail requis"),
  montant: z.coerce.number().int().positive("Montant requis"),
  moisConcerne: z.coerce.date(),
  modePaiement: z.enum(["ESPECES", "MOBILE_MONEY", "VIREMENT"]),
  notes: z.string().optional(),
});
