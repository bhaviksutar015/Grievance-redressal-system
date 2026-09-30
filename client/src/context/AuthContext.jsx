import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authClient } from "../lib/authClient";
import { api, clearTokenCache } from "../lib/api";

/**
 * Central authentication state.
 * - Session comes from Neon Auth (official React integration: useSession).
 * - The application profile (role CITIZEN/ADMIN, mobile, …) comes from the
 *   backend, which validates the Neon Auth JWT and manages the profiles table.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const { data } = await api.get("/auth/me");
      setProfile(data.data.profile);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    clearTokenCache();
    setProfile(null);
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === "ADMIN",
    loading: isPending || (Boolean(session?.user) && profileLoading && !profile),
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
