import { Link, Outlet, useRouterState } from "@tanstack/react-router";
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
} from "lucide-react";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/devis", label: "Devis", icon: FileText },
  { to: "/factures", label: "Factures", icon: Receipt },
  { to: "/comptabilite", label: "Comptabilité", icon: BookOpen },
  { to: "/parametres", label: "Paramètres", icon: Sliders },
];

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user?.username ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 shrink-0 bg-sidebar-bg text-sidebar-fg flex flex-col border-r border-sidebar-border">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shadow-sm">
            <Ship className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">BF LOGISTIC</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-muted">CRM Transitaire</div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
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
        <div className="p-3 border-t border-sidebar-border text-[11px] text-sidebar-muted">
          v1.0.0 · Exercice 2026
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-6 gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Rechercher facture, client, devis…"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4" />
          </button>
          <div className="relative pl-4 border-l border-border">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-muted/60 rounded-md px-1.5 py-1"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="leading-tight text-left">
                <div className="text-sm font-medium">{user?.username}</div>
                <div className="text-[11px] text-muted-foreground">{user?.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
