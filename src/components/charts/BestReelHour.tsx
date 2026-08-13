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
import type { HourSlice } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";

interface BestReelHourProps {
  data: HourSlice[];
}

export function BestReelHour({ data }: BestReelHourProps) {
  const c = useCssColors();
  const accent = c.accent || "#7b6cff";
  const accentStrong = c.accentStrong || "#9c8fff";
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };

  const peakHour = data.reduce(
    (best, h) => (h.posts > 0 && h.avgEngagement > best ? h.avgEngagement : best),
    0,
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={tick}
          tickLine={false}
          axisLine={false}
          minTickGap={20}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <Tooltip
          content={<ChartTooltip format={formatCompact} />}
          cursor={{ fill: c.line || "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="avgEngagement" name="Avg engagement" radius={[5, 5, 0, 0]} maxBarSize={16}>
          {data.map((d) => (
            <Cell
              key={d.hour}
              fill={d.posts > 0 && d.avgEngagement === peakHour ? accentStrong : accent}
              fillOpacity={d.posts > 0 && d.avgEngagement === peakHour ? 1 : 0.28}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
