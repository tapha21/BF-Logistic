import { Component, type ReactNode } from "react";
import { RouterProvider, Link } from "./lib/router";
import { AuthProvider, useAuth } from "./lib/auth";
import { StoreProvider } from "./lib/store";
import { LoginPage } from "./components/LoginPage";
import { AppLayout } from "./components/AppLayout";
import { reportLovableError } from "./lib/lovable-error-reporting";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    reportLovableError(error, { boundary: "app_error_boundary" });
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

function AuthGate() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <AppLayout notFound={<NotFoundPage />} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider>
        <AuthProvider>
          <StoreProvider>
            <AuthGate />
          </StoreProvider>
        </AuthProvider>
      </RouterProvider>
    </ErrorBoundary>
  );
}
