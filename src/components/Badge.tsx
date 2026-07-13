import type { ReactNode } from "react";

const TONE: Record<string, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/15 text-[oklch(0.5_0.15_75)] border-warning/40",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-info/12 text-info border-info/30",
  primary: "bg-primary/10 text-primary border-primary/25",
  purple: "bg-purple/12 text-purple border-purple/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Badge({ tone = "neutral", children, dot = false }: { tone?: keyof typeof TONE; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${TONE[tone]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, keyof typeof TONE> = {
    "Payée": "success",
    "Accepté": "success",
    "En attente": "warning",
    "Partiellement payée": "warning",
    "Envoyé": "info",
    "Brouillon": "neutral",
    "En retard": "danger",
    "Refusé": "danger",
  };
  return <Badge tone={map[statut] ?? "neutral"} dot>{statut}</Badge>;
}

export function TypeBadge({ type }: { type: "Vente" | "Achat" | "Entrée" | "Sortie" }) {
  const tone: keyof typeof TONE =
    type === "Vente" || type === "Entrée" ? "primary" : "purple";
  return <Badge tone={tone}>{type}</Badge>;
}

export const BADGE_TONES = TONE;