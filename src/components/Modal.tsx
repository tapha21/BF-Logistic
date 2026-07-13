import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Modal({
  open, onClose, title, children, size = "md",
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "md" | "lg" | "xl" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  const w = size === "xl" ? "max-w-5xl" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full ${w} bg-card border border-border rounded-xl shadow-2xl max-h-[85vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}