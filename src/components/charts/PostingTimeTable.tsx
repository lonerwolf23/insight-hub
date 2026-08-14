"use client";

import { ArrowDown, ArrowUp, Flame, Heart, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import type { HeatmapCell } from "@/lib/metrics";
import { formatCompact, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type SortKey = "engagement" | "posts" | "time";

interface PostingTimeTableProps {
  data: HeatmapCell[];
}

export function PostingTimeTable({ data }: PostingTimeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("engagement");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const populated = data.filter((c) => c.posts > 0);
    return [...populated].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "engagement") cmp = a.avgEngagement - b.avgEngagement;
      else if (sortKey === "posts") cmp = a.posts - b.posts;
      else cmp = a.day * 24 + a.hour - (b.day * 24 + b.hour);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, dir]);

  const maxEngagement = rows.reduce((m, r) => Math.max(m, r.avgEngagement), 0);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const isPeakSort = sortKey === "engagement" && dir === "desc";

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
    setPage(0);
  };

  const sortIcon = (key: SortKey) => {
    if (key !== sortKey) return null;
    return dir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-accent-strong" />
    ) : (
      <ArrowDown className="h-3 w-3 text-accent-strong" />
    );
  };

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">No posting-time data available.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-raised/30 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              <th className="px-3 py-2.5 font-semibold">
                <button
                  onClick={() => toggleSort("time")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Day &amp; hour
                  {sortIcon("time")}
                </button>
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                <button
                  onClick={() => toggleSort("engagement")}
                  className="ml-auto flex items-center gap-1 hover:text-foreground"
                >
                  <Heart className="h-3 w-3" />
                  Avg engagement
                  {sortIcon("engagement")}
                </button>
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                <button
                  onClick={() => toggleSort("posts")}
                  className="ml-auto flex items-center gap-1 hover:text-foreground"
                >
                  <MessageCircle className="h-3 w-3" />
                  Posts
                  {sortIcon("posts")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => {
              const isPeak = isPeakSort && safePage === 0 && i === 0;
              return (
                <tr
                  key={`${r.day}-${r.hour}`}
                  className={cn(
                    "border-b border-line/60 last:border-0 hover:bg-raised/30",
                    isPeak && "bg-accent-soft/40",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2 font-mono text-xs text-foreground">
                      {isPeak && <Flame className="h-3.5 w-3.5 shrink-0 text-accent-strong" />}
                      {r.dayLabel} {r.hourLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-raised/60">
                        <div
                          className="h-1.5 rounded-full bg-accent"
                          style={{
                            width: `${maxEngagement ? (r.avgEngagement / maxEngagement) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right font-mono text-xs text-foreground">
                        {formatCompact(r.avgEngagement)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-muted">
                    {formatNumber(r.posts)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-faint">
            Page {safePage + 1} of {totalPages} · {rows.length} time slots with posts
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
