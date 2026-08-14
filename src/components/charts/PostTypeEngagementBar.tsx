"use client";

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
import type { PostTypeSlice } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";

const TYPE_COLORS: Record<string, string> = {
  GraphImage: "info",
  GraphVideo: "accent",
  GraphSidecar: "warn",
};

interface PostTypeEngagementBarProps {
  data: PostTypeSlice[];
}

export function PostTypeEngagementBar({ data }: PostTypeEngagementBarProps) {
  const c = useCssColors();
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };
  const sorted = [...data].sort((a, b) => b.avgEngagement - a.avgEngagement);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <Tooltip
          content={<ChartTooltip format={formatCompact} />}
          cursor={{ fill: c.line || "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="avgEngagement" name="Avg engagement" radius={[6, 6, 0, 0]} maxBarSize={64}>
          {sorted.map((d) => (
            <Cell key={d.type} fill={(c[TYPE_COLORS[d.type] ?? "faint"] as string) || "#8d8da4"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
