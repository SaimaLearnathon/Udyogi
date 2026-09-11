import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "../api/profile";
import type { PublicUser } from "../types/profile";

interface AuthState {
  token: string | null;
  user: PublicUser | null;
  setSession: (token: string, user: PublicUser) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("uddogi_token"));
  const [user, setUser] = useState<PublicUser | null>(() => {
    const raw = localStorage.getItem("uddogi_user");
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  });

  // A stored user may be stale (cached from an earlier login, before the profile
  // shape changed on the server) or the session itself may have expired. Always
  // refresh from the server on load rather than trusting localStorage indefinitely.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    getProfile(token)
      .then((freshUser) => {
        if (cancelled) return;
        localStorage.setItem("uddogi_user", JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("uddogi_token");
        localStorage.removeItem("uddogi_user");
        setToken(null);
        setUser(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      setSession(nextToken, nextUser) {
        localStorage.setItem("uddogi_token", nextToken);
        localStorage.setItem("uddogi_user", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      clearSession() {
        localStorage.removeItem("uddogi_token");
        localStorage.removeItem("uddogi_user");
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
