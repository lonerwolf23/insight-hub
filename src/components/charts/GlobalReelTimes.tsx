"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import { useCssColors } from "@/components/charts/theme";
import { GLOBAL_REEL_TIMES } from "@/data/global-best-times";
import { formatHour12 } from "@/lib/format";

const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

export function GlobalReelTimes() {
  const c = useCssColors();
  const accent = c.accent || "#7b6cff";
  const grid = c.line || "rgba(255,255,255,0.08)";
  const tick = {
    fill: c.muted || "#8d8da4",
    fontSize: 10,
    fontFamily: "JetBrains Mono",
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis
          type="number"
          dataKey="hour"
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
          allowDuplicatedCategory={false}
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: grid }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as { day: string; hour: number };
            return (
              <div className="glass-soft px-3 py-2 text-xs">
                <span className="text-foreground">
                  {p.day} · {formatHour12(p.hour)}
                </span>
              </div>
            );
          }}
        />
        <Scatter data={GLOBAL_REEL_TIMES} fill={accent} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
