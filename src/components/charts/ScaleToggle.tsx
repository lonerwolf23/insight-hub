"use client";

import { cn } from "@/lib/utils";

interface ScaleToggleProps {
  value: "linear" | "log";
  onChange: (v: "linear" | "log") => void;
}

export function ScaleToggle({ value, onChange }: ScaleToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-raised/40 p-0.5">
      {(["linear", "log"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
            value === s
              ? "bg-accent-soft text-accent-strong"
              : "text-faint hover:text-muted",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
