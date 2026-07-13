import { useState } from "react";
import { Ship, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const r = login(email, password);
      if (!r.ok) setError(r.error ?? "Erreur");
      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 bg-primary text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold tracking-wide">BF LOGISTIC</div>
            <div className="text-[11px] opacity-80 uppercase tracking-widest">CRM Transitaire</div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-semibold leading-tight max-w-md">Pilotez votre activité de transitaire en toute simplicité.</h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md text-sm">Devis, factures, clients et comptabilité — une plateforme complète, inspirée des standards Sage.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            {[["+320", "Factures"], ["98%", "Recouvrement"], ["24/7", "Support"]].map(([v, l]) => (
              <div key={l} className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-md p-3">
                <div className="text-xl font-semibold">{v}</div>
                <div className="text-[11px] uppercase tracking-wide opacity-80">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs opacity-70 relative z-10">© 2026 BF Logistic · Tous droits réservés</div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-info/20 blur-3xl" />
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center"><Ship className="w-5 h-5" /></div>
            <div className="font-semibold">BF Logistic CRM</div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Bienvenue</h2>
            <p className="text-sm text-muted-foreground mt-1">Connectez-vous à votre espace administrateur.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
            <div className="flex items-center gap-2 border border-border bg-card rounded-md px-3 py-2 focus-within:border-primary">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="flex-1 bg-transparent outline-none text-sm" placeholder="admin@gmail.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mot de passe</label>
            <div className="flex items-center gap-2 border border-border bg-card rounded-md px-3 py-2 focus-within:border-primary">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="flex-1 bg-transparent outline-none text-sm" placeholder="••••" />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/25 rounded-md px-3 py-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Connexion…" : "Se connecter"}
          </button>
          <div className="text-[11px] text-muted-foreground text-center bg-muted/60 border border-border rounded-md p-2.5">
            Démo : <span className="font-mono">admin@gmail.com</span> / <span className="font-mono">1234</span>
          </div>
        </form>
      </div>
    </div>
  );
}