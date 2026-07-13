import { ChevronLeft, ChevronRight } from "lucide-react";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/30 text-xs">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>
          Affichage <span className="font-medium text-foreground">{from}–{to}</span> sur <span className="font-medium text-foreground">{total}</span>
        </span>
        {onPageSizeChange && pageSizeOptions && (
          <label className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Lignes</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-card border border-border rounded-md px-1.5 py-1 text-xs outline-none"
            >
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-md border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pageWindow(page, pages).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="text-muted-foreground px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] px-2 py-1 rounded-md text-xs ${p === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-background"}`}
            >
              {p}
            </button>
          ),
        )}
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
