import { Search } from "lucide-react";
import type { ReactNode } from "react";

export function FilterBar({
  search, onSearch, placeholder = "Rechercher…", right,
}: { search: string; onSearch: (s: string) => void; placeholder?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/20">
      <div className="flex items-center gap-2 flex-1 max-w-sm bg-card border border-border rounded-md px-2.5 py-1.5">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">{right}</div>
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