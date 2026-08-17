"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, useCssColors } from "@/components/charts/theme";
import type { SeriesPoint } from "@/lib/metrics";

interface PostsByMonthProps {
  data: SeriesPoint[];
}

export function PostsByMonth({ data }: PostsByMonthProps) {
  const c = useCssColors();
  const color = c.good || "#14ae5c";
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: c.line || "rgba(255,255,255,0.04)" }}
        />
        <Bar
          dataKey="posts"
          name="Posts"
          fill={color}
          radius={[5, 5, 0, 0]}
          maxBarSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
