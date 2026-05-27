import { auth } from "@/lib/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  return session;
}

export async function requireGestionnaire() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!role || !["GESTIONNAIRE", "SUPER_ADMIN"].includes(role)) {
    throw new Error("Accès réservé au gestionnaire");
  }
  return session!;
}

export async function requireLocataire() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "LOCATAIRE" || !(session?.user as any)?.locataireId) {
    throw new Error("Accès réservé au locataire");
  }
  return session!;
}
