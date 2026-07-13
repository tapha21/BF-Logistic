import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "success" | "destructive" | "warning" | "info" | "purple";

const PALETTE: Record<Tone, { bg: string; text: string; glow: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", glow: "bg-primary/25" },
  success: { bg: "bg-success/10", text: "text-success", glow: "bg-success/25" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", glow: "bg-destructive/25" },
  warning: { bg: "bg-warning/15", text: "text-[oklch(0.5_0.15_75)]", glow: "bg-warning/30" },
  info: { bg: "bg-info/10", text: "text-info", glow: "bg-info/25" },
  purple: { bg: "bg-purple/10", text: "text-purple", glow: "bg-purple/25" },
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  trend?: string;
}) {
  const p = PALETTE[tone];
  const trendUp = trend ? !trend.startsWith("-") : true;
  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${p.glow} opacity-30 blur-2xl group-hover:opacity-50 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${p.bg} ${p.text} ring-1 ring-inset ring-current/10`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${trendUp ? "text-success bg-success/10" : "text-destructive bg-destructive/10"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="relative mt-1 text-lg sm:text-2xl font-bold font-mono tracking-tight truncate">{value}</div>
      {sub && <div className="relative mt-1 text-xs text-muted-foreground truncate">{sub}</div>}
    </div>
  );
}
