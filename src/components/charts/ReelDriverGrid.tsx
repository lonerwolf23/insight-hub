"use client";

import { ProfileImage } from "@/components/ProfileImage";
import type { CaptionBucket, ProfileMetrics } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";

interface ReelDriverGridProps {
  metrics: ProfileMetrics[];
  hues: number[];
  title: string;
  description?: string;
  getBuckets: (m: ProfileMetrics) => CaptionBucket[];
}

/**
 * Lays out one bucketed-engagement column per selected profile so the reader
 * can see each account's own best-performing bucket for a given factor
 * (hashtag count, caption length, ...) side by side — bars are scaled to
 * each profile's own max, since raw engagement scales wildly with follower
 * count and would otherwise flatten the smaller accounts to nothing.
 */
export function ReelDriverGrid({
  metrics,
  hues,
  title,
  description,
  getBuckets,
}: ReelDriverGridProps) {
  return (
    <div className="glass p-5">
      <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>
      {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
      <div
        className="mt-4 grid gap-6"
        style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
      >
        {metrics.map((m, i) => (
          <ProfileBucketColumn
            key={m.username}
            metrics={m}
            hue={hues[i % hues.length]}
            buckets={getBuckets(m)}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileBucketColumn({
  metrics,
  hue,
  buckets,
}: {
  metrics: ProfileMetrics;
  hue: number;
  buckets: CaptionBucket[];
}) {
  const withData = buckets.filter((b) => b.count > 0);

  if (withData.length === 0) {
    return (
      <div className="min-w-0">
        <ColumnHeader metrics={metrics} hue={hue} />
        <p className="mt-3 text-xs text-faint">Not enough reels to tell.</p>
      </div>
    );
  }

  const max = Math.max(...withData.map((b) => b.avgEngagement), 1);
  const best = withData.reduce((a, b) => (b.avgEngagement > a.avgEngagement ? b : a));

  return (
    <div className="min-w-0">
      <ColumnHeader metrics={metrics} hue={hue} />
      <div className="mt-3 space-y-2">
        {withData.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span
              className="w-[6.5rem] shrink-0 truncate text-[11px] text-muted"
              title={b.label}
            >
              {b.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-raised/60">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max((b.avgEngagement / max) * 100, 4)}%`,
                  background: `hsl(${hue} 75% ${b.label === best.label ? 55 : 42}%)`,
                  opacity: b.label === best.label ? 1 : 0.55,
                }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-[10px] text-foreground">
              {formatCompact(b.avgEngagement)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-faint">
        Own best: <span className="text-foreground">{best.label}</span> (
        {formatCompact(best.avgEngagement)} avg, n={best.count})
      </p>
    </div>
  );
}

function ColumnHeader({ metrics, hue }: { metrics: ProfileMetrics; hue: number }) {
  return (
    <div className="flex items-center gap-2">
      <ProfileImage src={metrics.profilePicUrl} name={metrics.fullName} size={22} hue={hue} />
      <span className="truncate font-mono text-[11px] text-muted">@{metrics.username}</span>
    </div>
  );
}
