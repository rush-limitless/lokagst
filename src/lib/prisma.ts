import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Wrapper pour les server actions avec gestion d'erreurs uniforme */
export async function safeAction<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (e: any) {
    console.error("[ACTION_ERROR]", e?.message || e);
    // Sentry capture if available
    try { const Sentry = await import("@sentry/nextjs"); Sentry.captureException(e); } catch {}
    if (e?.code === "P2002") return { error: "Cette entrée existe déjà" };
    if (e?.code === "P2025") return { error: "Élément introuvable" };
    if (e?.code === "P2003") return { error: "Impossible de supprimer : des données liées existent" };
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }
}
