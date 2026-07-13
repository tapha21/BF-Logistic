import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  BookOpen,
  Search,
  Bell,
  Settings,
  Ship,
  LogOut,
  ChevronDown,
  Sliders,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { Link, usePathname } from "../lib/router";
import { Dashboard } from "../pages/Dashboard";
import { ClientsPage } from "../pages/Clients";
import { DevisPage } from "../pages/Devis";
import { FacturesPage } from "../pages/Factures";
import { ComptaPage } from "../pages/Comptabilite";
import { Parametres } from "../pages/Parametres";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/devis", label: "Devis", icon: FileText },
  { to: "/factures", label: "Factures", icon: Receipt },
  { to: "/comptabilite", label: "Comptabilité", icon: BookOpen },
  { to: "/parametres", label: "Paramètres", icon: Sliders },
];

function CurrentPage({ notFound }: { notFound: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return <Dashboard />;
  if (pathname.startsWith("/clients")) return <ClientsPage />;
  if (pathname.startsWith("/devis")) return <DevisPage />;
  if (pathname.startsWith("/factures")) return <FacturesPage />;
  if (pathname.startsWith("/comptabilite")) return <ComptaPage />;
  if (pathname.startsWith("/parametres")) return <Parametres />;
  return <>{notFound}</>;
}

export function AppLayout({ notFound }: { notFound: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const initials = (user?.username ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarContent = (
    <>
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shadow-sm">
          <Ship className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">BF LOGISTIC</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-muted">CRM Transitaire</div>
        </div>
        <button onClick={() => setMobileNavOpen(false)} className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-sidebar-active/60 text-sidebar-muted">
          <X className="w-4 h-4" />
        </button>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-active text-primary font-medium"
                  : "text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-active/60",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border text-[11px] text-sidebar-muted shrink-0">
        v2.0.0 · Exercice 2026
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-60 shrink-0 bg-sidebar-bg text-sidebar-fg flex-col border-r border-sidebar-border">
        {SidebarContent}
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar-bg text-sidebar-fg flex flex-col border-r border-sidebar-border shadow-2xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex flex-col min-h-screen min-w-0 lg:pl-60">
        <header className="h-14 border-b border-border bg-card flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shrink-0 sticky top-0 z-20">
          <button onClick={() => setMobileNavOpen(true)} className="p-2 -ml-1 text-muted-foreground hover:text-foreground lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              placeholder="Rechercher facture, client, devis…"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground min-w-0"
            />
          </div>
          <div className="flex-1 sm:hidden" />
          <button className="p-2 text-muted-foreground hover:text-foreground relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
          </button>
          <Link to="/parametres" className="p-2 text-muted-foreground hover:text-foreground hidden sm:inline-flex">
            <Settings className="w-4 h-4" />
          </Link>
          <div className="relative pl-2 sm:pl-4 sm:border-l border-border">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-muted/60 rounded-md px-1.5 py-1"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="leading-tight text-left hidden md:block">
                <div className="text-sm font-medium">{user?.username}</div>
                <div className="text-[11px] text-muted-foreground">{user?.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-md shadow-lg z-20 py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="text-sm font-medium">{user?.username}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <CurrentPage notFound={notFound} />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border bg-gradient-to-b from-card to-muted/20 px-4 sm:px-6 py-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
