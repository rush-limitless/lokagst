import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    locataireId?: string | null;
  }
  interface Session {
    user: User & { id: string; role: string; locataireId?: string | null };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    locataireId?: string | null;
  }
}
