import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the NextAuth setup: no Prisma, no bcrypt.
 * The middleware runs on the Edge runtime and can only read the JWT,
 * so the Credentials provider lives in `auth.ts` instead.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { id?: string }).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const tokenWithId = token as { id?: string };
      if (session.user && tokenWithId.id) {
        session.user.id = tokenWithId.id;
      }
      return session;
    },
  },
  trustHost: true,
};
