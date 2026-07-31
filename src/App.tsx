import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { RouterProvider, Link } from "./lib/router";
import { AuthProvider, useAuth } from "./lib/auth";
import { StoreProvider, useStore } from "./lib/store";
import { supabaseConfigured } from "./lib/supabase";
import { LoginPage } from "./components/LoginPage";
import { AppLayout } from "./components/AppLayout";
import { Toaster } from "./components/ui/sonner";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Cette page n'a pas pu s'afficher</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir à l'accueil.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => this.setState({ error: null })}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Réessayer
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Accueil
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ConfigMissingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">Configuration Supabase manquante</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Les variables <code className="font-mono">VITE_SUPABASE_URL</code> et{" "}
          <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> ne sont pas définies pour ce déploiement.
          Ajoutez-les dans Vercel → Project Settings → Environment Variables, puis redéployez.
        </p>
      </div>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
        />
        <p className="text-sm text-muted-foreground">Chargement des données…</p>
      </motion.div>
    </div>
  );
}

function StoreErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-md text-center"
      >
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Connexion à la base impossible</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </motion.div>
    </div>
  );
}

function StoreGate() {
  const { loading, error, reload } = useStore();
  if (loading) return <SplashScreen />;
  if (error) return <StoreErrorScreen message={error} onRetry={reload} />;
  return <AppLayout notFound={<NotFoundPage />} />;
}

function AuthGate() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <StoreGate />;
}

export function App() {
  if (!supabaseConfigured) return <ConfigMissingScreen />;
  return (
    <ErrorBoundary>
      <RouterProvider>
        <AuthProvider>
          <StoreProvider>
            <AuthGate />
          </StoreProvider>
        </AuthProvider>
      </RouterProvider>
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
}
