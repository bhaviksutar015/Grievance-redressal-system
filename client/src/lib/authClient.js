import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

/**
 * Official Neon Auth (Managed Better Auth) client for React/Vite.
 * All authentication (sign-up, sign-in, sessions, tokens) is handled by
 * Neon Auth — this app never stores or hashes passwords.
 */
export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
});
