"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, useCssColors } from "@/components/charts/theme";
import type { HashtagSlice } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const PALETTE = [
  "accent",
  "info",
  "good",
  "warn",
  "danger",
  "accentStrong",
  "good",
  "info",
  "warn",
  "accent",
  "danger",
  "info",
];

interface TopHashtagsProps {
  data: HashtagSlice[];
  effectivenessData?: HashtagSlice[];
}

export function TopHashtags({ data, effectivenessData }: TopHashtagsProps) {
  const [mode, setMode] = useState<"frequency" | "effectiveness">("frequency");
  const c = useCssColors();
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };

  const hasEffectiveness = !!effectivenessData?.length;
  const showEffectiveness = mode === "effectiveness" && hasEffectiveness;
  const active = showEffectiveness ? effectivenessData! : data;
  const dataKey = showEffectiveness ? "avgEngagement" : "count";
  const height = Math.max(200, active.length * 26 + 40);

  return (
    <div>
      {hasEffectiveness && (
        <div className="mb-3 flex w-fit items-center gap-1 rounded-lg border border-line bg-raised/40 p-0.5">
          {(
            [
              { key: "frequency", label: "Most used" },
              { key: "effectiveness", label: "Best performing" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                mode === opt.key
                  ? "bg-accent-soft text-accent-strong"
                  : "text-faint hover:text-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={active} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
          <XAxis
            type="number"
            tick={tick}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <YAxis
            type="category"
            dataKey="tag"
            width={150}
            tick={{ ...tick, fontSize: 9 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<ChartTooltip format={formatCompact} />}
            cursor={{ fill: c.line || "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey={dataKey}
            name={showEffectiveness ? "Avg engagement" : "Posts"}
            radius={[0, 5, 5, 0]}
            maxBarSize={18}
          >
            {active.map((d, i) => (
              <Cell key={d.tag} fill={(c[PALETTE[i % PALETTE.length]] as string) || "#7b6cff"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
