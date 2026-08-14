"use client";

import type { CaptionBucket, CaptionMetrics } from "@/lib/metrics";
import { formatCompact } from "@/lib/format";

interface CaptionInsightsProps {
  data: CaptionMetrics;
}

export function CaptionInsights({ data }: CaptionInsightsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <BucketGroup title="Caption length" buckets={data.length} />
      <BucketGroup title="Question in caption" buckets={data.question} />
      <BucketGroup title="Call-to-action phrasing" buckets={data.cta} />
      <BucketGroup title="Emoji use" buckets={data.emoji} />
    </div>
  );
}

function BucketGroup({ title, buckets }: { title: string; buckets: CaptionBucket[] }) {
  if (buckets.length === 0) {
    return (
      <div>
        <p className="label-mono mb-2 text-faint">{title}</p>
        <p className="text-xs text-faint">Not enough data.</p>
      </div>
    );
  }
  const max = Math.max(...buckets.map((b) => b.avgEngagement), 1);
  const best = buckets.reduce((a, b) => (b.avgEngagement > a.avgEngagement ? b : a));

  return (
    <div>
      <p className="label-mono mb-2 text-faint">{title}</p>
      <div className="space-y-2">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center gap-2.5">
            <span className="w-28 shrink-0 truncate text-xs text-muted">{b.label}</span>
            <div className="h-2 flex-1 rounded-full bg-raised/60">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max((b.avgEngagement / max) * 100, 3)}%`,
                  background: b.label === best.label ? "var(--accent-strong)" : "var(--accent)",
                  opacity: b.label === best.label ? 1 : 0.55,
                }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-[10px] text-foreground">
              {formatCompact(b.avgEngagement)}
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-[9px] text-faint">
              n={b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
