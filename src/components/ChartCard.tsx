import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  headerSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  headerSlot,
  children,
  className,
}: ChartCardProps) {
  return (
    <div className={cn("glass flex flex-col p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && <p className="mt-1 text-xs text-muted">{description}</p>}
        </div>
        {headerSlot}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
