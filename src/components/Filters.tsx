import { Search, CalendarRange, X } from "lucide-react";
import type { ReactNode } from "react";

export function FilterBar({
  search, onSearch, placeholder = "Rechercher…", right,
}: { search: string; onSearch: (s: string) => void; placeholder?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/20">
      <div className="flex items-center gap-2 w-full sm:max-w-sm sm:flex-1 bg-card border border-border rounded-md px-2.5 py-1.5">
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {right && <div className="flex items-center gap-2 flex-wrap">{right}</div>}
    </div>
  );
}

export function StatusSelect({
  value, onChange, options, label = "Tous les statuts",
}: { value: string; onChange: (v: string) => void; options: string[]; label?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-card border border-border rounded-md px-2.5 py-1.5 outline-none hover:bg-muted/40"
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function DateRangeFilter({
  from, to, onChange,
}: { from: string; to: string; onChange: (from: string, to: string) => void }) {
  const active = from || to;
  return (
    <div className="flex items-center gap-1.5 text-sm bg-card border border-border rounded-md px-2 py-1.5">
      <CalendarRange className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <input type="date" value={from} onChange={(e) => onChange(e.target.value, to)} className="bg-transparent outline-none w-[128px] text-xs" />
      <span className="text-muted-foreground text-xs">→</span>
      <input type="date" value={to} onChange={(e) => onChange(from, e.target.value)} className="bg-transparent outline-none w-[128px] text-xs" />
      {active && (
        <button onClick={() => onChange("", "")} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function ClientSelect({
  value, onChange, clients,
}: { value: string; onChange: (v: string) => void; clients: { id: string; nom: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-card border border-border rounded-md px-2.5 py-1.5 outline-none hover:bg-muted/40 max-w-[160px]"
    >
      <option value="">Tous les clients</option>
      {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
    </select>
  );
}
