"use client";

import { useMemo } from "react";

import type { HeatmapCell } from "@/lib/metrics";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

// Date#getDay() is 0=Sun..6=Sat; the report reads Monday-first.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface WeeklyTimeReportProps {
  heatmap: HeatmapCell[];
}

export function WeeklyTimeReport({ heatmap }: WeeklyTimeReportProps) {
  const { days, globalMax } = useMemo(() => {
    const globalMax = heatmap.reduce((m, c) => Math.max(m, c.posts), 0);
    const days = DAY_ORDER.map((day) => {
      const cells = [...heatmap.filter((c) => c.day === day)].sort((a, b) => a.hour - b.hour);
      const total = cells.reduce((s, c) => s + c.posts, 0);
      const topHours = [...cells]
        .filter((c) => c.posts > 0)
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 3)
        .map((c) => c.hourLabel);
      return { day, label: DAY_FULL[day], total, cells, topHours };
    });
    return { days, globalMax };
  }, [heatmap]);

  if (days.every((d) => d.total === 0)) {
    return <p className="py-10 text-center text-sm text-muted">No posting-time data available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-raised/30 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            <th className="px-3 py-2.5 font-semibold">Day</th>
            <th className="px-3 py-2.5 font-semibold">12 AM &rarr; 11 PM activity</th>
            <th className="px-3 py-2.5 text-right font-semibold">Posts</th>
            <th className="px-3 py-2.5 font-semibold">Usual times</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.day} className="border-b border-line/60 last:border-0 hover:bg-raised/30">
              <td className="px-3 py-2.5 align-top">
                <span className="font-display text-sm font-semibold tracking-tight">
                  {d.label}
                </span>
              </td>
              <td className="px-3 py-2.5 align-top">
                <div className="flex h-7 items-end gap-[2px]">
                  {d.cells.map((c) => (
                    <div
                      key={c.hour}
                      title={`${d.label} ${c.hourLabel}: ${c.posts} post${c.posts === 1 ? "" : "s"}`}
                      className={cn("w-2 rounded-t-sm", c.posts > 0 ? "bg-accent" : "bg-line")}
                      style={{
                        height:
                          c.posts > 0
                            ? `${Math.max(12, (c.posts / (globalMax || 1)) * 100)}%`
                            : "3px",
                      }}
                    />
                  ))}
                </div>
              </td>
              <td className="px-3 py-2.5 text-right align-top font-mono text-xs text-foreground">
                {formatNumber(d.total)}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-xs text-muted">
                {d.topHours.length ? d.topHours.join(" · ") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
