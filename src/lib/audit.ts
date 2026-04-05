import { prisma } from "./prisma";
import { auth } from "./auth";

export async function logAction(action: string, entite: string, entiteId?: string, details?: string) {
  const session = await auth();
  await prisma.auditLog.create({
    data: {
      utilisateur: session?.user?.email || "système",
      action,
      entite,
      entiteId: entiteId || null,
      details: details || null,
    },
  });
}
