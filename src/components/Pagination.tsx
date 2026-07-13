import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page, pageSize, total, onPageChange,
}: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 text-xs">
      <div className="text-muted-foreground">
        Affichage <span className="font-medium text-foreground">{from}–{to}</span> sur <span className="font-medium text-foreground">{total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-md border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 7).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[28px] px-2 py-1 rounded-md text-xs ${p === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-background"}`}
          >
            {p}
          </button>
        ))}
        {pages > 7 && <span className="text-muted-foreground px-1">…</span>}
        <button
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page >= pages}
          className="p-1.5 rounded-md border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function paginate<T>(items: T[], pageSize: number, page: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}