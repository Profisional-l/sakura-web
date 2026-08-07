"use client";

import type { ReactNode } from "react";

/**
 * Global providers. SessionProvider is intentionally NOT here —
 * it polls /api/auth/session on every page and spams 500s when AUTH_SECRET
 * is missing. Admin uses server auth() + next-auth/react signIn/signOut.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
