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
import type { HashtagSlice } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";

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
}

export function TopHashtags({ data }: TopHashtagsProps) {
  const c = useCssColors();
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };
  const height = Math.max(200, data.length * 26 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
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
        <Bar dataKey="count" name="Posts" radius={[0, 5, 5, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell key={d.tag} fill={(c[PALETTE[i % PALETTE.length]] as string) || "#7b6cff"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
