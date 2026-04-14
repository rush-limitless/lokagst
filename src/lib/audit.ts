import { prisma } from "./prisma";
import { auth } from "./auth";

export async function logAction(action: string, entite: string, entiteId?: string, details?: string) {
  try {
    const session = await auth();
    const email = session?.user?.email || "système";
    const role = (session?.user as any)?.role || "SYSTEM";

    // Build rich details
    const richDetails = [details, `[${role}] ${email}`].filter(Boolean).join(" | ");

    await prisma.auditLog.create({
      data: {
        utilisateur: email,
        action,
        entite,
        entiteId: entiteId || null,
        details: richDetails,
      },
    });
  } catch {
    // Ne pas bloquer l'action si le log échoue
  }
}

// Raccourcis
export const audit = {
  creation: (entite: string, id?: string, details?: string) => logAction("Création", entite, id, details),
  modification: (entite: string, id?: string, details?: string) => logAction("Modification", entite, id, details),
  suppression: (entite: string, id?: string, details?: string) => logAction("Suppression", entite, id, details),
  signature: (entite: string, id?: string, details?: string) => logAction("Signature", entite, id, details),
  resiliation: (entite: string, id?: string, details?: string) => logAction("Résiliation", entite, id, details),
  renouvellement: (entite: string, id?: string, details?: string) => logAction("Renouvellement", entite, id, details),
  paiement: (id?: string, details?: string) => logAction("Paiement", "Paiement", id, details),
  connexion: (email: string) => logAction("Connexion", "Utilisateur", undefined, email),
  archivage: (entite: string, id?: string, details?: string) => logAction("Archivage", entite, id, details),
};
