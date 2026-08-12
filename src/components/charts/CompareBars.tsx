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

import { formatCompact } from "@/lib/format";
import { ChartTooltip, useCssColors } from "@/components/charts/theme";

export interface CompareSeries {
  key: string;
  name: string;
  color: string;
}

interface CompareBarsProps {
  data: Record<string, string | number>[];
  series: CompareSeries[];
  scale?: "linear" | "log";
  height?: number;
}

export function CompareBars({ data, series, scale = "linear", height = 260 }: CompareBarsProps) {
  const c = useCssColors();
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
        <YAxis
          scale={scale === "log" ? "log" : "linear"}
          domain={scale === "log" ? [1, "auto"] : [0, "auto"]}
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <Tooltip
          content={<ChartTooltip format={formatCompact} />}
          cursor={{ fill: c.line || "rgba(255,255,255,0.04)" }}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
