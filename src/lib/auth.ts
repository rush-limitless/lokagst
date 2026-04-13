import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;
        if (!email || !password) return null;

        const user = await prisma.utilisateur.findUnique({ where: { email } });
        if (!user) return null;

        if (user.bloqueJusqua && user.bloqueJusqua > new Date()) return null;

        const valid = await compare(password, user.motDePasse);
        if (!valid) {
          const attempts = user.tentativesEchouees + 1;
          await prisma.utilisateur.update({
            where: { id: user.id },
            data: {
              tentativesEchouees: attempts,
              bloqueJusqua:
                attempts >= 5
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : undefined,
            },
          });
          return null;
        }

        await prisma.utilisateur.update({
          where: { id: user.id },
          data: { tentativesEchouees: 0, bloqueJusqua: null },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          locataireId: user.locataireId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.locataireId = (user as any).locataireId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).locataireId = token.locataireId;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 15 * 60 },
});
