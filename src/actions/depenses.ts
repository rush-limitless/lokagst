"use server";

import { prisma, safeAction } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

export async function getDepenses(filters?: { immeubleId?: string; categorie?: string; annee?: number }) {
  const where: any = {};
  if (filters?.immeubleId) where.immeubleId = filters.immeubleId;
  if (filters?.categorie) where.categorie = filters.categorie;
  if (filters?.annee) {
    where.date = { gte: new Date(filters.annee, 0, 1), lt: new Date(filters.annee + 1, 0, 1) };
  }

  return prisma.depense.findMany({
    where,
    include: { immeuble: { select: { nom: true } } },
    orderBy: { date: "desc" },
  }).catch(() => []);
}

export async function creerDepense(formData: FormData) {
  return safeAction(async () => {
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const montant = parseInt(formData.get("montant") as string);
    const date = formData.get("date") ? new Date(formData.get("date") as string) : new Date();
    const immeubleId = (formData.get("immeubleId") as string) || null;
    const fournisseur = (formData.get("fournisseur") as string) || null;
    const reference = (formData.get("reference") as string) || null;
    const justificatif = (formData.get("justificatif") as string) || null;

    if (!categorie || !description || !montant || montant <= 0) return { error: "Champs requis manquants" };

    await prisma.depense.create({ data: { categorie: categorie as any, description, montant, date, immeubleId, fournisseur, reference, justificatif } });
    await logAction("Création", "Dépense", description, `${montant} FCFA — ${categorie}`);
    revalidatePath("/depenses");
    return { success: true };
  });
}

export async function supprimerDepense(id: string) {
  return safeAction(async () => {
    await prisma.depense.delete({ where: { id } });
    revalidatePath("/depenses");
    return { success: true };
  });
}

export async function getBilanComptable(annee: number) {
  const debut = new Date(annee, 0, 1);
  const fin = new Date(annee + 1, 0, 1);

  const [paiements, depenses, immeubles] = await Promise.all([
    prisma.paiement.findMany({ where: { moisConcerne: { gte: debut, lt: fin } } }),
    prisma.depense.findMany({ where: { date: { gte: debut, lt: fin } }, include: { immeuble: { select: { id: true, nom: true } } } }).catch(() => [] as any[]),
    prisma.immeuble.findMany({ select: { id: true, nom: true } }),
  ]);

  const totalRevenus = paiements.reduce((s, p) => s + p.montant, 0);
  const totalLoyers = paiements.reduce((s, p) => s + p.montantLoyer, 0);
  const totalCharges = paiements.reduce((s, p) => s + p.montantCharges, 0);
  const totalCautions = paiements.reduce((s, p) => s + p.montantCaution, 0);
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
  const resultatNet = totalRevenus - totalDepenses;

  // Par catégorie
  const parCategorie: Record<string, number> = {};
  for (const d of depenses) { parCategorie[d.categorie] = (parCategorie[d.categorie] || 0) + d.montant; }

  // Par immeuble
  const parImmeuble = immeubles.map((imm) => {
    const dep = depenses.filter((d) => d.immeubleId === imm.id).reduce((s, d) => s + d.montant, 0);
    return { id: imm.id, nom: imm.nom, depenses: dep };
  });

  // Par mois
  const parMois = Array.from({ length: 12 }, (_, i) => {
    const mDebut = new Date(annee, i, 1);
    const mFin = new Date(annee, i + 1, 1);
    const label = mDebut.toLocaleDateString("fr-FR", { month: "short" });
    const rev = paiements.filter((p) => p.moisConcerne >= mDebut && p.moisConcerne < mFin).reduce((s, p) => s + p.montant, 0);
    const dep = depenses.filter((d) => d.date >= mDebut && d.date < mFin).reduce((s, d) => s + d.montant, 0);
    return { mois: label, revenus: rev, depenses: dep, net: rev - dep };
  });

  return { annee, totalRevenus, totalLoyers, totalCharges, totalCautions, totalDepenses, resultatNet, parCategorie, parImmeuble, parMois };
}
