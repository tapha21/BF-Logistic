import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
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
} from "lucide-react";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/devis", label: "Devis", icon: FileText },
  { to: "/factures", label: "Factures", icon: Receipt },
  { to: "/comptabilite", label: "Comptabilité", icon: BookOpen },
];

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 shrink-0 bg-sidebar-bg text-sidebar-fg flex flex-col border-r border-sidebar-border">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center">
            <Ship className="w-5 h-5 text-accent-foreground" />
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
                  "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
                  active
                    ? "bg-sidebar-active text-sidebar-fg border-l-2 border-accent"
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
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              BF
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-[11px] text-muted-foreground">Comptabilité</div>
            </div>
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
