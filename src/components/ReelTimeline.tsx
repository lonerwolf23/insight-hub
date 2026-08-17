"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Heart, MessageCircle, PlayCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import type { Post } from "@/lib/types";
import { isReel } from "@/lib/metrics";
import { formatDate, formatNumber, formatTime, formatWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ReelTimelineProps {
  posts: Post[];
}

export function ReelTimeline({ posts }: ReelTimelineProps) {
  const reels = useMemo(
    () =>
      posts
        .filter(isReel)
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [posts],
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (reels.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">No reels found for this account.</p>;
  }

  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(reels.length - 1, i));
    const card = track.children[clamped] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setIndex(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    const stride = first && second ? second.offsetLeft - first.offsetLeft : 1;
    const i = Math.round(track.scrollLeft / (stride || 1));
    setIndex(Math.max(0, Math.min(reels.length - 1, i)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-faint">
          Reel {index + 1} of {formatNumber(reels.length)} · newest first
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollToIndex(index - 1)}
            disabled={index === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous reel"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollToIndex(index + 1)}
            disabled={index === reels.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next reel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
      >
        {reels.map((r, i) => (
          <div
            key={r.post_id}
            className={cn(
              "glass-soft w-[240px] shrink-0 snap-start p-4 transition-colors",
              i === index && "border-accent/50",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                <PlayCircle className="h-3.5 w-3.5" />
                Reel
              </span>
              <span className="font-mono text-[10px] text-faint">#{i + 1}</span>
            </div>
            <p className="mt-3 font-display text-sm font-semibold tracking-tight">
              {formatWeekday(r.timestamp)} · {formatTime(r.timestamp)}
            </p>
            <p className="font-mono text-[11px] text-faint">{formatDate(r.timestamp)}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-danger" />
                {formatNumber(r.likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-info" />
                {formatNumber(r.comments_count)}
              </span>
            </div>
            <p
              className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted"
              title={r.caption ?? ""}
            >
              {r.caption || "No caption"}
            </p>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:text-accent-strong"
            >
              View reel
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
