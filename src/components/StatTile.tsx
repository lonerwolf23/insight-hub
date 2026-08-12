import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  icon?: LucideIcon;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "good" | "danger" | "accent";
  className?: string;
}

const TONES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-foreground",
  good: "text-good",
  danger: "text-danger",
  accent: "text-accent-strong",
};

export function StatTile({
  label,
  icon: Icon,
  value,
  sub,
  tone = "default",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "glass-soft group flex flex-col gap-2 p-4 transition-all duration-300 hover:border-line-strong",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label-mono text-faint">{label}</span>
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-faint transition-colors group-hover:text-accent" />
        )}
      </div>
      <div className={cn("font-display text-2xl font-semibold tracking-tight", TONES[tone])}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}
