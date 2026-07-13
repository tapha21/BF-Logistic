import { Check } from "lucide-react";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center px-4 sm:px-5 py-4 border-b border-border bg-muted/20 overflow-x-auto">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors",
                  done ? "bg-primary text-primary-foreground" : active ? "bg-primary/15 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-10 h-px mx-2 sm:mx-3 ${i < current ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
