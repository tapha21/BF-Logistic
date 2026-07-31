import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type User = { username: string; email: string; role: string };

type Ctx = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

function toUser(supaUser: SupabaseUser | null | undefined): User | null {
  if (!supaUser) return null;
  const meta = supaUser.user_metadata ?? {};
  return {
    email: supaUser.email ?? "",
    username: (meta.username as string) || (supaUser.email?.split("@")[0] ?? "Utilisateur"),
    role: (meta.role as string) || "Administrateur",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // Ne pas définir `user` depuis la réponse directe : le client Supabase propage
    // le token aux en-têtes REST via l'évènement onAuthStateChange (ci-dessus), qui
    // se déclenche juste après. Si on court-circuite avec setUser ici, StoreProvider
    // peut monter et lancer ses requêtes avant que ce token soit propagé (401/RLS).
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Identifiants incorrects" };
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!ready) return null;
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
