import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { username: string; email: string; role: string };

const DEFAULT_USER: User = { username: "Baba Faty", email: "admin@gmail.com", role: "Administrateur" };
const KEY = "bf-logistic-auth-v1";

type Ctx = {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const login = (email: string, password: string) => {
    if (email.trim().toLowerCase() === "admin@gmail.com" && password === "1234") {
      setUser(DEFAULT_USER);
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(DEFAULT_USER));
      return { ok: true };
    }
    return { ok: false, error: "Identifiants incorrects" };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  };

  if (!ready) return null;
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}