import { createContext, useContext, useMemo, useState } from "react";
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
