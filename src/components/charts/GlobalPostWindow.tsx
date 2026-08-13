"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useCssColors } from "@/components/charts/theme";
import { GLOBAL_POST_WINDOWS } from "@/data/global-best-times";
import { formatHour12 } from "@/lib/format";
import type { GlobalPostWindow } from "@/data/global-best-times";

const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

export function GlobalPostWindowChart() {
  const c = useCssColors();
  const info = c.info || "#55c2f5";
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={GLOBAL_POST_WINDOWS}
        layout="vertical"
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 24]}
          ticks={HOUR_TICKS}
          tickFormatter={(h: number) => formatHour12(h)}
          tick={tick}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="day"
          reversed
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          cursor={{ fill: c.line || "rgba(255,255,255,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as GlobalPostWindow;
            return (
              <div className="glass-soft px-3 py-2 text-xs">
                <p className="text-foreground">
                  {p.day} · {p.note}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="start" stackId="range" fill="transparent" isAnimationActive={false} />
        <Bar
          dataKey="duration"
          stackId="range"
          fill={info}
          radius={[4, 4, 4, 4]}
          maxBarSize={18}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
