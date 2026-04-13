"use server";

import { prisma } from "@/lib/prisma";

export async function getDocumentsLocataire(locataireId: string) {
  const locataire = await prisma.locataire.findUnique({
    where: { id: locataireId },
    include: {
      baux: {
        include: { appartement: true, etatsDesLieux: true },
        orderBy: { creeLe: "desc" },
      },
    },
  });
  if (!locataire) return null;

  const documents: { type: string; nom: string; statut: "signe" | "non_signe" | "uploade"; lien?: string; bailId?: string }[] = [];

  for (const bail of locataire.baux) {
    // Contrat de bail
    documents.push({
      type: "contrat",
      nom: `Contrat de bail — ${bail.appartement.numero}`,
      statut: bail.signatureLocataire ? "signe" : "non_signe",
      lien: bail.signatureLocataire ? `/baux/${bail.id}/contrat` : `/baux/${bail.id}`,
      bailId: bail.id,
    });

    // Contrat enregistré (scan uploadé)
    if (bail.contratUpload) {
      documents.push({
        type: "contrat_enregistre",
        nom: `Contrat enregistré (scan) — ${bail.appartement.numero}`,
        statut: "uploade",
        lien: bail.contratUpload,
        bailId: bail.id,
      });
    } else {
      documents.push({
        type: "contrat_enregistre",
        nom: `Contrat enregistré (scan) — ${bail.appartement.numero}`,
        statut: "non_signe",
        lien: `/baux/${bail.id}`,
        bailId: bail.id,
      });
    }

    // États des lieux
    for (const edl of bail.etatsDesLieux) {
      const signe = !!(edl.signatureLocataire && edl.signatureGestionnaire);
      documents.push({
        type: "edl",
        nom: `État des lieux ${edl.type === "ENTREE" ? "d'entrée" : "de sortie"} — ${bail.appartement.numero}`,
        statut: signe ? "signe" : "non_signe",
        bailId: bail.id,
      });
    }

    // Si pas d'EDL d'entrée
    if (!bail.etatsDesLieux.some((e) => e.type === "ENTREE")) {
      documents.push({
        type: "edl",
        nom: `État des lieux d'entrée — ${bail.appartement.numero}`,
        statut: "non_signe",
        lien: `/baux/${bail.id}/edl`,
        bailId: bail.id,
      });
    }
  }

  // Règlement intérieur
  documents.push({
    type: "reglement",
    nom: "Règlement intérieur",
    statut: "non_signe",
  });

  return { locataire, documents };
}
