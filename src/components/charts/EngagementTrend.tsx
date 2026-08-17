"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, useCssColors } from "@/components/charts/theme";
import type { Granularity, SeriesPoint } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

interface EngagementTrendProps {
  seriesByGranularity: Record<Granularity, SeriesPoint[]>;
}

export function EngagementTrend({ seriesByGranularity }: EngagementTrendProps) {
  const [g, setG] = useState<Granularity>("day");
  const c = useCssColors();
  const accent = c.accent || "#0d99ff";
  const info = c.info || "#9747ff";
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };
  const data = seriesByGranularity[g];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            Likes
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: info }} />
            Comments
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-raised/40 p-0.5">
          {GRANULARITIES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setG(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                g === opt.value
                  ? "bg-accent-soft text-accent-strong"
                  : "text-faint hover:text-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-likes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="grad-comments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={info} stopOpacity={0.3} />
              <stop offset="100%" stopColor={info} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={tick}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={tick}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip content={<ChartTooltip format={formatCompact} />} />
          <Area
            type="monotone"
            dataKey="likes"
            name="Likes"
            stroke={accent}
            strokeWidth={2}
            fill="url(#grad-likes)"
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Area
            type="monotone"
            dataKey="comments"
            name="Comments"
            stroke={info}
            strokeWidth={2}
            fill="url(#grad-comments)"
            dot={false}
            activeDot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
