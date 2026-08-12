"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip, useCssColors } from "@/components/charts/theme";
import type { PostTypeSlice } from "@/lib/metrics";
import { formatNumber } from "@/lib/format";

const TYPE_COLORS: Record<string, string> = {
  GraphImage: "info",
  GraphVideo: "accent",
  GraphSidecar: "warn",
};

interface PostTypeDonutProps {
  data: PostTypeSlice[];
}

export function PostTypeDonut({ data }: PostTypeDonutProps) {
  const c = useCssColors();
  const resolve = (name: string) => (c[name] as string) || "#8d8da4";
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              cornerRadius={4}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.type} fill={resolve(TYPE_COLORS[d.type] ?? "faint")} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {formatNumber(total)}
          </span>
          <span className="label-mono text-faint">posts</span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {data.map((d) => (
          <div key={d.type} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: resolve(TYPE_COLORS[d.type] ?? "faint") }}
            />
            <span className="text-xs text-muted">{d.label}</span>
            <span className="ml-auto font-mono text-xs text-foreground">
              {formatNumber(d.count)}
            </span>
            <span className="w-12 text-right font-mono text-[10px] text-faint">
              {d.share.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
