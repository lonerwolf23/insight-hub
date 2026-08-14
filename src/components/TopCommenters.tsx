"use client";

import { Heart, Trophy } from "lucide-react";

import type { CommenterSlice } from "@/lib/metrics";
import { formatNumber } from "@/lib/format";

interface TopCommentersProps {
  data: CommenterSlice[];
}

export function TopCommenters({ data }: TopCommentersProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Trophy className="h-6 w-6 text-faint" />
        <p className="text-sm text-muted">No comment text was captured for this profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((c, i) => (
        <div key={c.commenter} className="glass-soft flex items-center gap-3 p-3">
          <span className="w-5 shrink-0 text-center font-mono text-xs text-faint">{i + 1}</span>
          <span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold text-accent-strong">
            @{c.commenter}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted">
            {formatNumber(c.count)} comment{c.count === 1 ? "" : "s"}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-faint">
            <Heart className="h-3 w-3" />
            {formatNumber(c.totalLikesGiven)}
          </span>
        </div>
      ))}
    </div>
  );
}
